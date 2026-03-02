import { create } from 'zustand'

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: Date
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  phone?: string
  email?: string
  patientType: 'OPD' | 'IPD' | 'EMERGENCY'
}

interface PatientSearchParams {
  search: string
  page: number
  limit: number
  patientType?: 'OPD' | 'IPD' | 'EMERGENCY'
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
}

interface PatientState {
  patients: Patient[]
  selectedPatient: Patient | null
  searchParams: PatientSearchParams
  total: number
  totalPages: number
  isLoading: boolean
  setPatients: (patients: Patient[]) => void
  setSelectedPatient: (patient: Patient | null) => void
  setSearchParams: (params: Partial<PatientSearchParams>) => void
  setPagination: (total: number, totalPages: number) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  patients: [],
  selectedPatient: null,
  searchParams: {
    search: '',
    page: 1,
    limit: 10,
  },
  total: 0,
  totalPages: 0,
  isLoading: false,
}

export const usePatientStore = create<PatientState>((set) => ({
  ...initialState,
  setPatients: (patients) => set({ patients }),
  setSelectedPatient: (selectedPatient) => set({ selectedPatient }),
  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),
  setPagination: (total, totalPages) => set({ total, totalPages }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}))
