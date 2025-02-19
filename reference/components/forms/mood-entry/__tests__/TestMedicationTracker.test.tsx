import { render, screen, fireEvent } from '@testing-library/react'
import { TestMedicationTracker } from './TestMedicationTracker'
import { TestMoodEntryWrapper } from './TestWrapper'

describe('TestMedicationTracker', () => {
  const renderComponent = (props = {}) => {
    return render(
      <TestMoodEntryWrapper>
        <TestMedicationTracker {...props} />
      </TestMoodEntryWrapper>
    )
  }

  it('renders with empty state', () => {
    renderComponent()
    
    expect(screen.getByText('Medication Tracker')).toBeInTheDocument()
    expect(screen.getByText('No medications added yet')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter medication name and dosage')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe how this affected you...')).toBeInTheDocument()
  })

  it('adds new medication', () => {
    const onMedicationsChange = jest.fn()
    renderComponent({ onMedicationsChange })
    
    const input = screen.getByPlaceholderText('Enter medication name and dosage')
    fireEvent.change(input, { target: { value: 'Test Med 10mg' } })
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByText('Test Med 10mg')).toBeInTheDocument()
    expect(input).toHaveValue('')
    expect(onMedicationsChange).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'Test Med 10mg', taken: false })
    ]))
  })

  it('toggles medication status', () => {
    const onMedicationsChange = jest.fn()
    renderComponent({ onMedicationsChange })
    
    // Add a medication first
    const input = screen.getByPlaceholderText('Enter medication name and dosage')
    fireEvent.change(input, { target: { value: 'Test Med 10mg' } })
    fireEvent.click(screen.getByRole('button'))
    
    // Toggle its status
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    
    expect(toggle).toBeChecked()
    expect(screen.getByText('Test Med 10mg').parentElement).toHaveClass('line-through')
    expect(onMedicationsChange).toHaveBeenLastCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'Test Med 10mg', taken: true })
    ]))
  })

  it('removes medication', () => {
    const onMedicationsChange = jest.fn()
    renderComponent({ onMedicationsChange })
    
    // Add a medication first
    const input = screen.getByPlaceholderText('Enter medication name and dosage')
    fireEvent.change(input, { target: { value: 'Test Med 10mg' } })
    fireEvent.click(screen.getByRole('button'))
    
    // Remove it
    fireEvent.click(screen.getByRole('button', { name: /trash/i }))
    
    expect(screen.queryByText('Test Med 10mg')).not.toBeInTheDocument()
    expect(screen.getByText('No medications added yet')).toBeInTheDocument()
    expect(onMedicationsChange).toHaveBeenLastCalledWith([])
  })

  it('handles Enter key to add medication', () => {
    renderComponent()
    
    const input = screen.getByPlaceholderText('Enter medication name and dosage')
    fireEvent.change(input, { target: { value: 'Test Med 10mg' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(screen.getByText('Test Med 10mg')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('prevents adding empty medication names', () => {
    renderComponent()
    
    const input = screen.getByPlaceholderText('Enter medication name and dosage')
    const addButton = screen.getByRole('button')
    
    expect(addButton).toBeDisabled()
    
    fireEvent.change(input, { target: { value: '   ' } })
    expect(addButton).toBeDisabled()
    
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('No medications added yet')).toBeInTheDocument()
  })

  it('handles notes input', () => {
    renderComponent()
    
    const notesInput = screen.getByPlaceholderText('Describe how this affected you...')
    fireEvent.change(notesInput, { target: { value: 'Side effects: mild drowsiness' } })
    
    expect(notesInput).toHaveValue('Side effects: mild drowsiness')
  })
}) 