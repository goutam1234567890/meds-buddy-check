globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

import { describe, it, expect, vi } from 'vitest';
import { getMedications, addMedication, deleteMedication } from '../api/medications';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('medications API', () => {
  it('should fetch medications', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: 1, name: 'Aspirin', dosage: '100mg', frequency: 'daily', taken_dates: [], user_id: 1 }])
    });
    const meds = await getMedications();
    expect(meds[0].name).toBe('Aspirin');
  });

  it('should add a medication', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2, name: 'Paracetamol', dosage: '500mg', frequency: 'daily', taken_dates: [] })
    });
    const med = await addMedication({ name: 'Paracetamol', dosage: '500mg', frequency: 'daily' });
    expect(med.name).toBe('Paracetamol');
  });

  it('should delete a medication', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    const res = await deleteMedication(2);
    expect(res.success).toBe(true);
  });
});
