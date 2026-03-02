import { create } from 'zustand'

interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  appointmentDate: Date
  startTime: Date
  endTime: Date
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  priority: 'ROUTINE' | 'URGENT' | 'STAT'
  reason?: string
  tokenNumber?: number
}

interface AppointmentState {
  appointments: Appointment[]
  selectedAppointment: Appointment | null
  selectedDate: Date
  viewMode: 'day' | 'week' | 'month'
  isLoading: boolean
  setAppointments: (appointments: Appointment[]) => void
  setSelectedAppointment: (appointment: Appointment | null) => void
  setSelectedDate: (date: Date) => void
  setViewMode: (mode: 'day' | 'week' | 'month') => void
  setLoading: (loading: boolean) => void
  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, data: Partial<Appointment>) => void
  removeAppointment: (id: string) => void
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  selectedAppointment: null,
  selectedDate: new Date(),
  viewMode: 'day',
  isLoading: false,
  setAppointments: (appointments) => set({ appointments }),
  setSelectedAppointment: (selectedAppointment) => set({ selectedAppointment }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setViewMode: (viewMode) => set({ viewMode }),
  setLoading: (isLoading) => set({ isLoading }),
  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [...state.appointments, appointment],
    })),
  updateAppointment: (id, data) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),
  removeAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.filter((a) => a.id !== id),
    })),
}))
