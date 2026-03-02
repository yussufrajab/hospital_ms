import 'next-auth'

declare module 'next-auth' {
  interface User {
    id?: string
    role: string
    staffId?: string
    patientId?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      staffId?: string
      patientId?: string
    }
  }
}
