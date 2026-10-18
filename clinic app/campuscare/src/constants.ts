import { URGENCY_LABELS, STATUS_LABELS, CATEGORY_LABELS } from './lib/types';
import type { Urgency } from './lib/types';

export { URGENCY_LABELS, STATUS_LABELS, CATEGORY_LABELS };

export const URGENCY_COLORS: Record<Urgency, string> = {
  ROUTINE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  URGENT: 'bg-amber-50 text-amber-700 ring-amber-200',
  EMERGENCY: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export const SLOT_TIMES = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30',
];

export const CLINIC = {
  name: 'CampusCare Health Center',
  phone: '+1 (555) 010-0700',
  address: 'Health Services Bldg, 24 University Way',
  hours: [
    { day: 'Monday – Friday', time: '8:00 AM – 6:00 PM' },
    { day: 'Saturday', time: '9:00 AM – 1:00 PM' },
    { day: 'Sunday', time: 'Closed (emergency line open)' },
  ],
};
