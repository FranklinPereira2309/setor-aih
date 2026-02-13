
export interface Patient {
  id: string;
  name: string;
  phone: string;
  cadSus: string; // 15 digits
  updatedAt: number;
}

export interface DocumentConfig {
  procedimento: string;
  isItabuna: boolean;
  isMPactuado: boolean;
  deliveryDate: string;
  returnDate: string;
  printTime: string;
}

export type PatientFormData = Omit<Patient, 'id' | 'updatedAt'>;
