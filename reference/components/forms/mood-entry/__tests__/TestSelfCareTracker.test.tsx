import { render, screen, fireEvent } from '@testing-library/react'
import { TestSelfCareTracker } from './TestSelfCareTracker'
import { TestMoodEntryWrapper } from './TestWrapper'

describe('TestSelfCareTracker', () => {
  const renderComponent = (props = {}) => {
    return render(
      <TestMoodEntryWrapper>
        <TestSelfCareTracker {...props} />
      </TestMoodEntryWrapper>
    )
  }

  it('renders with empty state', () => {
    renderComponent()
    
    expect(screen.getByText('Self-Care Activities')).toBeInTheDocument()
    expect(screen.getByText('No activities added yet')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter self-care activity')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe how this affected you...')).toBeInTheDocument()
  })

  it('adds a new activity', () => {
    const onActivitiesChange = jest.fn()
    renderComponent({ onActivitiesChange })
    
    const input = screen.getByPlaceholderText('Enter self-care activity')
    fireEvent.change(input, { target: { value: 'Test Activity' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    expect(screen.getByText('Test Activity')).toBeInTheDocument()
    expect(onActivitiesChange).toHaveBeenCalled()
  })

  it('toggles activity completion', () => {
    renderComponent()
    
    // Add activity
    const input = screen.getByPlaceholderText('Enter self-care activity')
    fireEvent.change(input, { target: { value: 'Test Activity' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Toggle completion
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()
  })

  it('changes activity impact', () => {
    renderComponent()
    
    // Add activity
    const input = screen.getByPlaceholderText('Enter self-care activity')
    fireEvent.change(input, { target: { value: 'Test Activity' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Complete activity to show impact buttons
    fireEvent.click(screen.getByRole('switch'))
    
    // Change impact
    fireEvent.click(screen.getByText('very helpful'))
    expect(screen.getByRole('button', { name: 'very helpful' })).toHaveClass('bg-green-500')
  })

  it('removes an activity', () => {
    renderComponent()
    
    // Add activity
    const input = screen.getByPlaceholderText('Enter self-care activity')
    fireEvent.change(input, { target: { value: 'Test Activity' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Remove activity
    fireEvent.click(screen.getByRole('button', { name: /trash/i }))
    expect(screen.queryByText('Test Activity')).not.toBeInTheDocument()
  })

  it('handles Enter key to add activity', () => {
    renderComponent()
    
    const input = screen.getByPlaceholderText('Enter self-care activity')
    fireEvent.change(input, { target: { value: 'Test Activity' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(screen.getByText('Test Activity')).toBeInTheDocument()
  })

  it('handles notes input', () => {
    renderComponent()
    
    const notesInput = screen.getByPlaceholderText('Describe how this affected you...')
    fireEvent.change(notesInput, { target: { value: 'Self-care routine improved mood' } })
    
    expect(notesInput).toHaveValue('Self-care routine improved mood')
  })
}) 