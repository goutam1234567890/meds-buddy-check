import React, { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  initial: { name: string; dosage: string; frequency: string };
  onSave: (values: { name: string; dosage: string; frequency: string }) => void;
};

const EditMedicationModal: React.FC<Props> = ({ open, onClose, initial, onSave }) => {
  const [name, setName] = useState(initial.name);
  const [dosage, setDosage] = useState(initial.dosage);
  const [frequency, setFrequency] = useState(initial.frequency);

  // Reset form fields when modal opens or initial values change
  useEffect(() => {
    setName(initial.name);
    setDosage(initial.dosage);
    setFrequency(initial.frequency);
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-xl min-w-[320px]">
        <h2 className="text-lg font-bold mb-4">Edit Medication</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave({ name, dosage, frequency });
          }}
          className="space-y-2"
        >
          <div>
            <label className="block text-sm">
              Name
              <input
                className="border p-1 rounded w-full"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label className="block text-sm">
              Dosage
              <input
                className="border p-1 rounded w-full"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label className="block text-sm">
              Frequency
              <input
                className="border p-1 rounded w-full"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
              Save
            </button>
            <button type="button" className="bg-gray-200 px-4 py-1 rounded" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicationModal;