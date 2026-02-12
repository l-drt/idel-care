export type UserRole = 'NURSE' | 'PRESCRIBER' | 'PROVIDER' | 'ADMIN';

export interface PatientBase {
  firstName: string;
  lastName: string;
  birthDate: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  email?: string;
  allergies?: string[];
}

export interface Patient extends PatientBase {
  id: string;
  createdAt: string;
  updatedAt: string;
  ssn?: string;
  latitude?: number;
  longitude?: number;
  medicalHistory?: unknown;
  currentTreatments?: unknown;
  consentGiven: boolean;
  consentDate?: string;
  deletedAt?: string;
}
