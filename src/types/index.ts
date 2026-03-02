import type { UserRole } from '@prisma/client'

export type { UserRole }

export interface UserSession {
  id: string
  email: string
  name: string
  role: UserRole
  staffId?: string
  patientId?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Role-based route access
export const roleRoutes: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['/admin', '/staff', '/patients', '/appointments', '/pharmacy', '/lab', '/radiology', '/billing', '/wards', '/reports'],
  HOSPITAL_ADMIN: ['/admin', '/staff', '/patients', '/appointments', '/pharmacy', '/lab', '/radiology', '/billing', '/wards', '/reports'],
  DOCTOR: ['/doctor', '/patients', '/appointments', '/pharmacy', '/lab', '/radiology'],
  NURSE: ['/nurse', '/patients', '/appointments'],
  RECEPTIONIST: ['/receptionist', '/patients', '/appointments', '/billing'],
  PHARMACIST: ['/pharmacist', '/pharmacy'],
  LAB_TECHNICIAN: ['/lab', '/lab-orders'],
  RADIOLOGIST: ['/radiology', '/radiology-orders'],
  BILLING_STAFF: ['/billing', '/patients'],
  INSURANCE_OFFICER: ['/billing', '/insurance'],
  WARD_MANAGER: ['/wards', '/patients'],
  PATIENT: ['/patient', '/appointments', '/billing'],
}

// Permission definitions
export const permissions = {
  PATIENT_MANAGEMENT: {
    VIEW: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'BILLING_STAFF'],
    CREATE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'],
    UPDATE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    DELETE: ['SUPER_ADMIN'],
  },
  APPOINTMENT_MANAGEMENT: {
    VIEW: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'],
    CREATE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'PATIENT'],
    UPDATE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST'],
    DELETE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN'],
  },
  PRESCRIPTION_MANAGEMENT: {
    VIEW: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST', 'PATIENT'],
    CREATE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'],
    DISPENSE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST'],
  },
  LAB_MANAGEMENT: {
    VIEW: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'PATIENT'],
    ORDER: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'],
    PROCESS: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN'],
  },
  BILLING_MANAGEMENT: {
    VIEW: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'BILLING_STAFF', 'PATIENT'],
    CREATE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'BILLING_STAFF'],
    UPDATE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'BILLING_STAFF'],
  },
  STAFF_MANAGEMENT: {
    VIEW: ['SUPER_ADMIN', 'HOSPITAL_ADMIN'],
    CREATE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN'],
    UPDATE: ['SUPER_ADMIN', 'HOSPITAL_ADMIN'],
    DELETE: ['SUPER_ADMIN'],
  },
} as const
