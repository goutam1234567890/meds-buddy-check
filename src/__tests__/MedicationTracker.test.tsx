import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MedicationTracker from '../components/MedicationTracker';

describe('MedicationTracker', () => {
  it('renders taken state', () => {
    render(
      <MedicationTracker
        date="2025-06-20"
        isTaken={true}
        onMarkTaken={() => {}}
        isToday={true}
        medicationId={1}
        proofPhotoUrl="/uploads/test.jpg"
      />
    );
    expect(screen.getByText(/Medication Completed/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Proof/i)).toBeInTheDocument();
  });

  it('calls onMarkTaken when button is clicked', () => {
    const onMarkTaken = vi.fn();
    render(
      <MedicationTracker
        date="2025-06-20"
        isTaken={false}
        onMarkTaken={onMarkTaken}
        isToday={true}
        medicationId={1}
      />
    );
    const button = screen.getByRole('button', { name: /Mark as Taken/i });
    fireEvent.click(button);
    expect(onMarkTaken).toHaveBeenCalled();
  });
});
