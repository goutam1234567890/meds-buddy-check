const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;
const SECRET = 'your-secret-key';

app.use(cors({
  origin: 'https://meds-buddy-check-1.onrender.com', // your frontend Render URL
  credentials: true
}));
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Authentication middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Signup
app.post('/api/signup', (req, res) => {
  const { username, password, role } = req.body;
  if (!(username && password && (role === 'patient' || role === 'caretaker')))
    return res.status(400).json({ error: 'Invalid input' });
  const hash = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hash, role],
    function (err) {
      if (err) return res.status(400).json({ error: 'User exists' });
      const token = jwt.sign({ id: this.lastID, username, role }, SECRET);
      res.json({ token, user: { id: this.lastID, username, role } });
    }
  );
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

// Add Medication
app.post('/api/medications', auth, (req, res) => {
  const { name, dosage, frequency } = req.body;
  if (!(name && dosage && frequency)) return res.status(400).json({ error: 'Invalid input' });
  db.run(
    'INSERT INTO medications (user_id, name, dosage, frequency, taken_dates) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, name, dosage, frequency, JSON.stringify([])],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ id: this.lastID, name, dosage, frequency, taken_dates: [] });
    }
  );
});

// Get Medications
app.get('/api/medications', auth, (req, res) => {
  db.all(
    'SELECT * FROM medications WHERE user_id = ?',
    [req.user.id],
    (err, meds) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      meds.forEach(med => {
        med.taken_dates = med.taken_dates ? JSON.parse(med.taken_dates) : [];
      });
      res.json(meds);
    }
  );
});

// Mark Medication as Taken
app.post('/api/medications/:id/take', auth, (req, res) => {
  const medId = req.params.id;
  const today = new Date().toISOString().slice(0, 10);
  db.get(
    'SELECT * FROM medications WHERE id = ? AND user_id = ?',
    [medId, req.user.id],
    (err, med) => {
      if (!med) return res.status(404).json({ error: 'Not found' });
      let taken = [];
      try { taken = JSON.parse(med.taken_dates); } catch {}
      if (!taken.includes(today)) taken.push(today);
      db.run(
        'UPDATE medications SET taken_dates = ? WHERE id = ?',
        [JSON.stringify(taken), medId],
        function (err) {
          if (err) return res.status(500).json({ error: 'DB error' });
          res.json({ ...med, taken_dates: taken });
        }
      );
    }
  );
});

// Delete Medication
app.delete('/api/medications/:id', auth, (req, res) => {
  db.run(
    'DELETE FROM medications WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ success: true });
    }
  );
});

// *** Update Medication (PUT) ***
app.put('/api/medications/:id', auth, (req, res) => {
  const { id } = req.params;
  const { name, dosage, frequency } = req.body;
  if (!name || !dosage || !frequency) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  // Only allow the owner to update
  db.run(
    'UPDATE medications SET name = ?, dosage = ?, frequency = ? WHERE id = ? AND user_id = ?',
    [name, dosage, frequency, id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Medication not found' });
      res.json({ success: true, id, name, dosage, frequency });
    }
  );
});

// Get Adherence Percentage
app.get('/api/medications/adherence', auth, (req, res) => {
  db.all(
    'SELECT * FROM medications WHERE user_id = ?',
    [req.user.id],
    (err, meds) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      if (meds.length === 0) {
        return res.json({ adherence: 0 });
      }

      // Calculate adherence over the last 30 days
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      let totalExpectedDoses = 0;
      let actualTakenDoses = 0;

      meds.forEach(med => {
        const takenDates = med.taken_dates ? JSON.parse(med.taken_dates) : [];
        
        // For each day in the last 30 days, this medication should have been taken
        for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10);
          totalExpectedDoses++;
          
          if (takenDates.includes(dateStr)) {
            actualTakenDoses++;
          }
        }
      });

      const adherence = totalExpectedDoses > 0 ? Math.round((actualTakenDoses / totalExpectedDoses) * 100) : 0;
      res.json({ adherence });
    }
  );
});

// Upload proof photo for a medication
app.post('/api/medications/:id/proof', auth, upload.single('photo'), (req, res) => {
  const medId = req.params.id;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photoPath = req.file.path;
  db.run(
    'UPDATE medications SET proof_photo = ? WHERE id = ? AND user_id = ?',
    [photoPath, medId, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Medication not found' });
      res.json({ success: true, photoPath });
    }
  );
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));