# Meds Buddy Check

A modern medication management system for patients and caretakers. Built with React, Node.js, and SQLite. Features role-based dashboards, medication tracking, adherence stats, and photo proof uploads.

---

## 🚀 Features
- **User Authentication:** Secure signup/login for patients and caretakers (SQLite + JWT)
- **Patient Dashboard:**
  - Add, edit, delete medications
  - Mark medications as taken
  - View adherence stats and completion rate
  - Upload photo proof for medication
- **Caretaker Dashboard:**
  - Monitor patient adherence (auto-refreshes)
  - View adherence %, streaks, missed/taken days, and recent activity
- **Adherence Tracking:**
  - Calculates adherence percentage for each patient
- **Real-Time Updates:**
  - Caretaker dashboard polls for new data every few seconds
- **File Uploads:**
  - Patients can upload a photo as proof when marking medication as taken

---

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js (Express), SQLite
- **State Management:** React hooks
- **APIs:** RESTful endpoints
- **Testing:** Vitest, React Testing Library

---

## ⚡ Quickstart

### 1. Clone the Repo
```sh
git clone <your-repo-url>
cd meds-buddy-check
```

### 2. Install Dependencies
#### Backend
```sh
cd backend
npm install
```
#### Frontend
```sh
cd ..
npm install
```

### 3. Run the App
#### Start Backend
```sh
cd backend
npm start
```
#### Start Frontend
```sh
cd ..
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧑‍💻 Usage
### Patients
- Sign up / log in as a patient
- Add, edit, or delete your medications
- Mark a medication as taken each day (optionally upload a photo)
- Track your daily and overall adherence

### Caretakers
- Sign up / log in as a caretaker
- Switch to the caretaker dashboard
- Monitor patient medication adherence (dashboard auto-refreshes)
- See streaks, missed days, and detailed activity calendar

---

## 🧪 Testing
- Unit tests with [Vitest](https://vitest.dev/)
- Run:
  ```sh
  npm run test
  ```

---

## 📁 Project Structure
```
meds-buddy-check/
  backend/
    db.js
    index.js
    meds-buddy.db
    package.json
  public/
  src/
    api/
    components/
    hooks/
    lib/
    pages/
    ...
  package.json
  README.md
```

---

## 📝 Customization & Extending
- To support multiple patients per caretaker, update the backend to associate patients/caretakers and add a patient selector in the dashboard.
- For instant real-time updates, use WebSockets (Socket.IO) instead of polling.
- Add email/SMS notifications for missed doses.
- Add more advanced adherence analytics.

---
