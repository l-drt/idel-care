export interface VitalSignBase {
  patientId: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  glucose?: number;
  weight?: number;
}

export interface VitalSign extends VitalSignBase {
  id: string;
  recordedById: string;
  recordedAt: string;
  isAbnormal: boolean;
  alertMessage?: string;
}
