import { render, screen, fireEvent } from '@testing-library/react'
import { TestSocialTracker } from './TestSocialTracker'
import { TestMoodEntryWrapper } from './TestWrapper'

describe('TestSocialTracker', () => {
  const renderComponent = (props = {}) => {
    return render(
      <TestMoodEntryWrapper>
        <TestSocialTracker {...props} />
      </TestMoodEntryWrapper>
    )
  }

  it('renders with empty state', () => {
    renderComponent()
    
    expect(screen.getByText('Social Interactions')).toBeInTheDocument()
    expect(screen.getByText('No interactions added yet')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter interaction')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe how this affected you...')).toBeInTheDocument()
  })

  it('adds a new interaction', () => {
    const onInteractionsChange = jest.fn()
    renderComponent({ onInteractionsChange })
    
    const input = screen.getByPlaceholderText('Enter interaction')
    fireEvent.change(input, { target: { value: 'Test Interaction' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    expect(screen.getByText('Test Interaction')).toBeInTheDocument()
    expect(onInteractionsChange).toHaveBeenCalled()
  })

  it('toggles interaction completion', () => {
    renderComponent()
    
    // Add interaction
    const input = screen.getByPlaceholderText('Enter interaction')
    fireEvent.change(input, { target: { value: 'Test Interaction' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Toggle completion
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()
  })

  it('changes interaction impact', () => {
    renderComponent()
    
    // Add interaction
    const input = screen.getByPlaceholderText('Enter interaction')
    fireEvent.change(input, { target: { value: 'Test Interaction' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Complete interaction to show impact buttons
    fireEvent.click(screen.getByRole('switch'))
    
    // Change impact
    fireEvent.click(screen.getByText('very positive'))
    expect(screen.getByRole('button', { name: 'very positive' })).toHaveClass('bg-green-500')
  })

  it('removes an interaction', () => {
    renderComponent()
    
    // Add interaction
    const input = screen.getByPlaceholderText('Enter interaction')
    fireEvent.change(input, { target: { value: 'Test Interaction' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Remove interaction
    fireEvent.click(screen.getByRole('button', { name: /trash/i }))
    expect(screen.queryByText('Test Interaction')).not.toBeInTheDocument()
  })

  it('handles Enter key to add interaction', () => {
    renderComponent()
    
    const input = screen.getByPlaceholderText('Enter interaction')
    fireEvent.change(input, { target: { value: 'Test Interaction' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(screen.getByText('Test Interaction')).toBeInTheDocument()
  })

  it('handles notes input', () => {
    renderComponent()
    
    const notesInput = screen.getByPlaceholderText('Describe how this affected you...')
    fireEvent.change(notesInput, { target: { value: 'Social interaction improved my mood' } })
    
    expect(notesInput).toHaveValue('Social interaction improved my mood')
  })
}) 