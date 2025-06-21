const API_URL = "https://meds-buddy-check-euqj.onrender.com/api";

function getToken() {
  return localStorage.getItem("token");
}

// Fetch all medications for the logged-in user
export async function getMedications() {
  const res = await fetch(`${API_URL}/medications`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch medications");
  return await res.json();
}

// Add a new medication
export async function addMedication({ name, dosage, frequency }: { name: string, dosage: string, frequency: string }) {
  const res = await fetch(`${API_URL}/medications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name, dosage, frequency }),
  });
  if (!res.ok) throw new Error("Failed to add medication");
  return await res.json();
}

// Mark a medication as taken
export async function takeMedication(id: number) {
  const res = await fetch(`${API_URL}/medications/${id}/take`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to mark as taken");
  return await res.json();
}

// Delete a medication
export async function deleteMedication(id: number) {
  const res = await fetch(`${API_URL}/medications/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to delete medication");
  return await res.json();
}

// Get adherence percentage
export async function getAdherence() {
  const res = await fetch(`${API_URL}/medications/adherence`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to get adherence");
  return await res.json();
}

// Fixed updateMedication function
export async function updateMedication(
  id: number,
  payload: { name: string; dosage: string; frequency: string }
) {
  const res = await fetch(`${API_URL}/medications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update medication");
  return res.json();
}

// Upload proof photo for a medication
export async function uploadProofPhoto(medicationId: number, file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await fetch(`${API_URL}/medications/${medicationId}/proof`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload proof photo');
  return await res.json();
}