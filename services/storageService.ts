import { Patient } from '../types';

const API_URL = 'http://localhost:3001/api/data';

interface DB {
  patients: Patient[];
  logo: string | null;
}

let dbCache: DB = { patients: [], logo: null };

const syncWithFile = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbCache)
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to sync with file:', err);
    return false;
  }
};

export const storageService = {
  loadData: async (): Promise<void> => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        dbCache = await response.json();
      }
    } catch (err) {
      console.error('Failed to load data from file:', err);
    }
  },

  getPatients: (): Patient[] => {
    return dbCache.patients;
  },

  savePatients: (patients: Patient[]): void => {
    dbCache.patients = patients;
    syncWithFile();
  },

  addPatient: (patient: Patient): void => {
    dbCache.patients.push(patient);
    syncWithFile();
  },

  updatePatient: (updatedPatient: Patient): void => {
    const index = dbCache.patients.findIndex(p => p.id === updatedPatient.id);
    if (index !== -1) {
      dbCache.patients[index] = updatedPatient;
      syncWithFile();
    }
  },

  deletePatient: (id: string): void => {
    dbCache.patients = dbCache.patients.filter(p => p.id !== id);
    syncWithFile();
  },

  saveLogo: (base64: string): void => {
    dbCache.logo = base64;
    syncWithFile();
  },

  getLogo: (): string | null => {
    return dbCache.logo;
  },

  clearLogo: (): void => {
    dbCache.logo = null;
    syncWithFile();
  }
};
