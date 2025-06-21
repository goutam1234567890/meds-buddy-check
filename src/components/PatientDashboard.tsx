import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, User, Check, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { getMedications, addMedication, takeMedication, deleteMedication, getAdherence, updateMedication, uploadProofPhoto } from "@/api/medications";
import EditMedicationModal from "./EditMedicationModal";
import MedicationTracker from "./MedicationTracker";

type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  taken_dates: string[];
  user_id: number;
  proof_photo?: string; // Add proof_photo to type
};

function isTakenToday(med: Medication) {
  const today = format(new Date(), "yyyy-MM-dd");
  return Array.isArray(med.taken_dates) && med.taken_dates.includes(today);
}

const PatientDashboard = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For adding new medication
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Adherence stats
  const [adherence, setAdherence] = useState<number | null>(null);

  // For editing medication
  const [editId, setEditId] = useState<number | null>(null);
  const [editInitial, setEditInitial] = useState<{ name: string; dosage: string; frequency: string }>({
    name: "",
    dosage: "",
    frequency: "",
  });
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchMedications();
    fetchAdherence();
    // eslint-disable-next-line
  }, []);

  async function fetchMedications() {
    setLoading(true);
    setError(null);
    try {
      const meds = await getMedications();
      setMedications(Array.isArray(meds) ? meds : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch medications");
    }
    setLoading(false);
  }

  async function fetchAdherence() {
    try {
      const result = await getAdherence();
      setAdherence(result.adherence ?? null);
    } catch (err) {
      setAdherence(null);
    }
  }

  async function handleAddMedication(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    try {
      await addMedication({ name, dosage, frequency });
      setName("");
      setDosage("");
      setFrequency("");
      await fetchMedications();
      await fetchAdherence();
    } catch (err: any) {
      setError(err.message || "Failed to add medication");
    }
    setAddLoading(false);
  }

  async function handleMarkTaken(medId: number, file?: File) {
    try {
      if (file) {
        await uploadProofPhoto(medId, file);
      }
      await takeMedication(medId);
      // Always refresh medications after marking as taken or uploading photo
      await fetchMedications();
      await fetchAdherence();
    } catch (err: any) {
      setError(err.message || "Failed to mark as taken");
    }
  }

  async function handleDeleteMedication(medId: number) {
    if (!window.confirm("Are you sure you want to delete this medication?")) return;
    try {
      await deleteMedication(medId);
      await fetchMedications();
      await fetchAdherence();
    } catch (err: any) {
      setError(err.message || "Failed to delete medication");
    }
  }

  async function handleEditMedication(values: { name: string; dosage: string; frequency: string }) {
    if (editId !== null) {
      try {
        await updateMedication(editId, values);
        setEditOpen(false);
        await fetchMedications();
      } catch (err: any) {
        setError(err.message || "Failed to update medication");
      }
    }
  }

  const takenCount = medications.filter(med => isTakenToday(med)).length;
  const totalCount = medications.length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}!
            </h2>
            <p className="text-white/90 text-lg">Ready to stay on track with your medication?</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{takenCount}</div>
            <div className="text-white/80">Medications Taken Today</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{totalCount - takenCount}</div>
            <div className="text-white/80">Pending Today</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {totalCount === 0 ? "0%" : Math.round((takenCount / totalCount) * 100) + "%"}
            </div>
            <div className="text-white/80">Today's Completion Rate</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {adherence !== null ? `${adherence}%` : "--"}
            </div>
            <div className="text-white/80">Overall Adherence</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Medication */}
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                Today's Medication
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="text-red-600 mb-2">{error}</div>}

              <form onSubmit={handleAddMedication} className="mb-6 space-y-2">
                <div className="flex gap-2">
                  <input
                    className="border p-2 rounded w-1/4"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <input
                    className="border p-2 rounded w-1/4"
                    placeholder="Dosage"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    required
                  />
                  <input
                    className="border p-2 rounded w-1/4"
                    placeholder="Frequency"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    required
                  />
                  <button
                    className="bg-blue-600 text-white rounded px-4 py-2"
                    type="submit"
                    disabled={addLoading}
                  >
                    {addLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              </form>

              {loading ? (
                <div>Loading medications...</div>
              ) : medications.length === 0 ? (
                <div>No medications found.</div>
              ) : (
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Dosage</th>
                      <th className="p-2">Frequency</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map(med => (
                      <tr key={med.id} className={isTakenToday(med) ? "bg-green-50" : ""}>
                        <td className="p-2">{med.name}</td>
                        <td className="p-2">{med.dosage}</td>
                        <td className="p-2">{med.frequency}</td>
                        <td className="p-2">
                          {isTakenToday(med) ? (
                            <span className="text-green-700 font-semibold">Taken</span>
                          ) : (
                            <span className="text-yellow-700">Pending</span>
                          )}
                        </td>
                        <td className="p-2 flex gap-2">
                          {!isTakenToday(med) && (
                            <button
                              className="bg-green-600 text-white rounded px-3 py-1"
                              onClick={() => handleMarkTaken(med.id)}
                            >
                              Mark as Taken
                            </button>
                          )}
                          <button
                            className="bg-yellow-600 text-white rounded px-3 py-1 flex items-center gap-1"
                            onClick={() => {
                              setEditId(med.id);
                              setEditInitial({ name: med.name, dosage: med.dosage, frequency: med.frequency });
                              setEditOpen(true);
                            }}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-600 text-white rounded px-3 py-1 flex items-center gap-1"
                            onClick={() => handleDeleteMedication(med.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar (placeholder, not connected) */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Medication Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500">
                <Check className="inline w-4 h-4 text-green-600 mr-1" /> Mark medications as taken to see your progress!
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Medication Modal */}
      <EditMedicationModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={editInitial}
        onSave={handleEditMedication}
      />

      {/* Medication Trackers */}
      <div className="mt-8">
        {medications.map(med => (
          <div key={med.id} className="mb-6">
            <MedicationTracker
              date={format(new Date(), "yyyy-MM-dd")}
              isTaken={isTakenToday(med)}
              onMarkTaken={(_, file) => handleMarkTaken(med.id, file)}
              isToday={true}
              medicationId={med.id}
              proofPhotoUrl={med.proof_photo ? `http://localhost:4000/${med.proof_photo.replace(/\\/g, '/')}` : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;