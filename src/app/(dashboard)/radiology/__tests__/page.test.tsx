import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import RadiologyDashboard from '../page'

describe('Radiology Dashboard', () => {
  it('renders the dashboard header', () => {
    render(<RadiologyDashboard />)
    expect(screen.getByText('Radiology Dashboard')).toBeInTheDocument()
  })

  it('renders stats cards', () => {
    render(<RadiologyDashboard />)
    expect(screen.getByText('Pending Scans')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Completed Today')).toBeInTheDocument()
    // Critical Findings appears multiple times, use getAllByText
    expect(screen.getAllByText('Critical Findings').length).toBeGreaterThan(0)
  })

  it('renders pending orders section', () => {
    render(<RadiologyDashboard />)
    expect(screen.getByText('Pending Orders')).toBeInTheDocument()
    expect(screen.getByText('Radiology orders awaiting processing')).toBeInTheDocument()
  })

  it('renders critical findings section', () => {
    render(<RadiologyDashboard />)
    expect(screen.getAllByText('Critical Findings').length).toBeGreaterThan(0)
    expect(screen.getByText('Findings requiring immediate attention')).toBeInTheDocument()
  })

  it('renders recent results section', () => {
    render(<RadiologyDashboard />)
    expect(screen.getByText('Recent Results')).toBeInTheDocument()
    expect(screen.getByText('Recently completed radiology studies')).toBeInTheDocument()
  })

  it('renders quick actions', () => {
    render(<RadiologyDashboard />)
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    // View Orders appears multiple times, use getAllByText
    expect(screen.getAllByText('View Orders').length).toBeGreaterThan(0)
    expect(screen.getByText('Enter Results')).toBeInTheDocument()
    expect(screen.getByText('Test Catalog')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
  })

  it('renders sample patient data', () => {
    render(<RadiologyDashboard />)
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Emily Brown')).toBeInTheDocument()
    expect(screen.getByText('Robert Johnson')).toBeInTheDocument()
  })
})
