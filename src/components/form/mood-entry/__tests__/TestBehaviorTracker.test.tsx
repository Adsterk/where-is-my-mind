import { render, screen, fireEvent } from '@testing-library/react'
import { TestBehaviorTracker } from './TestBehaviorTracker'
import { TestMoodEntryWrapper } from './TestWrapper'

describe('TestBehaviorTracker', () => {
  const renderComponent = (props = {}) => {
    return render(
      <TestMoodEntryWrapper>
        <TestBehaviorTracker {...props} />
      </TestMoodEntryWrapper>
    )
  }

  it('renders with empty state', () => {
    renderComponent()
    
    expect(screen.getByText('Behaviors')).toBeInTheDocument()
    expect(screen.getByText('No behaviors added yet')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter behavior')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe how this affected you...')).toBeInTheDocument()
  })

  it('adds a new behavior', () => {
    const onBehaviorsChange = jest.fn()
    renderComponent({ onBehaviorsChange })
    
    const input = screen.getByPlaceholderText('Enter behavior')
    fireEvent.change(input, { target: { value: 'Test Behavior' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    expect(screen.getByText('Test Behavior')).toBeInTheDocument()
    expect(onBehaviorsChange).toHaveBeenCalled()
  })

  it('toggles behavior completion', () => {
    renderComponent()
    
    // Add behavior
    const input = screen.getByPlaceholderText('Enter behavior')
    fireEvent.change(input, { target: { value: 'Test Behavior' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Toggle completion
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()
  })

  it('changes behavior impact', () => {
    renderComponent()
    
    // Add behavior
    const input = screen.getByPlaceholderText('Enter behavior')
    fireEvent.change(input, { target: { value: 'Test Behavior' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Complete behavior to show impact buttons
    fireEvent.click(screen.getByRole('switch'))
    
    // Change impact
    fireEvent.click(screen.getByText('very harmful'))
    expect(screen.getByRole('button', { name: 'very harmful' })).toHaveClass('bg-red-500')
  })

  it('removes a behavior', () => {
    renderComponent()
    
    // Add behavior
    const input = screen.getByPlaceholderText('Enter behavior')
    fireEvent.change(input, { target: { value: 'Test Behavior' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Remove behavior
    fireEvent.click(screen.getByRole('button', { name: /trash/i }))
    expect(screen.queryByText('Test Behavior')).not.toBeInTheDocument()
  })

  it('handles Enter key to add behavior', () => {
    renderComponent()
    
    const input = screen.getByPlaceholderText('Enter behavior')
    fireEvent.change(input, { target: { value: 'Test Behavior' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(screen.getByText('Test Behavior')).toBeInTheDocument()
  })

  it('handles notes input', () => {
    renderComponent()
    
    const notesInput = screen.getByPlaceholderText('Describe how this affected you...')
    fireEvent.change(notesInput, { target: { value: 'This behavior impacted my mood negatively' } })
    
    expect(notesInput).toHaveValue('This behavior impacted my mood negatively')
  })
}) 