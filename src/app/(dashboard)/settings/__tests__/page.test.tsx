import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SettingsPage from '../page'

// Mock the useSession hook
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'DOCTOR',
      },
    },
    status: 'authenticated',
  })),
}))

describe('Settings Page', () => {
  it('renders the settings page header', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your account and application preferences')).toBeInTheDocument()
  })

  it('renders personal settings section', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Personal Settings')).toBeInTheDocument()
  })

  it('renders profile settings card', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Profile Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your personal information and preferences')).toBeInTheDocument()
  })

  it('renders security settings card', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Password and authentication settings')).toBeInTheDocument()
  })

  it('renders notification settings card', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Configure notification preferences')).toBeInTheDocument()
  })

  it('renders appearance settings card', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Theme and display settings')).toBeInTheDocument()
  })

  it('does not render admin settings for non-admin users', () => {
    render(<SettingsPage />)
    expect(screen.queryByText('Administration')).not.toBeInTheDocument()
  })

  it('renders current session information', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Current Session')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
})
