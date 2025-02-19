import { render, screen, fireEvent } from '@testing-library/react'
import { TestSkillsTracker } from './TestSkillsTracker'
import { TestMoodEntryWrapper } from './TestWrapper'

describe('TestSkillsTracker', () => {
  const renderComponent = (props = {}) => {
    return render(
      <TestMoodEntryWrapper>
        <TestSkillsTracker {...props} />
      </TestMoodEntryWrapper>
    )
  }

  it('renders with empty state', () => {
    renderComponent()
    
    expect(screen.getByText('Skills Used')).toBeInTheDocument()
    expect(screen.getByText('No skills added yet')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter skill')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe how this affected you...')).toBeInTheDocument()
  })

  it('adds a new skill', () => {
    const onSkillsChange = jest.fn()
    renderComponent({ onSkillsChange })
    
    const input = screen.getByPlaceholderText('Enter skill')
    fireEvent.change(input, { target: { value: 'Test Skill' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    expect(screen.getByText('Test Skill')).toBeInTheDocument()
    expect(onSkillsChange).toHaveBeenCalled()
  })

  it('toggles skill completion', () => {
    renderComponent()
    
    // Add skill
    const input = screen.getByPlaceholderText('Enter skill')
    fireEvent.change(input, { target: { value: 'Test Skill' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Toggle completion
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()
  })

  it('changes skill effectiveness', () => {
    renderComponent()
    
    // Add skill
    const input = screen.getByPlaceholderText('Enter skill')
    fireEvent.change(input, { target: { value: 'Test Skill' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Complete skill to show effectiveness buttons
    fireEvent.click(screen.getByRole('switch'))
    
    // Change effectiveness
    fireEvent.click(screen.getByText('very effective'))
    expect(screen.getByRole('button', { name: 'very effective' })).toHaveClass('bg-green-500')
  })

  it('removes a skill', () => {
    renderComponent()
    
    // Add skill
    const input = screen.getByPlaceholderText('Enter skill')
    fireEvent.change(input, { target: { value: 'Test Skill' } })
    fireEvent.click(screen.getByRole('button', { name: /plus/i }))
    
    // Remove skill
    fireEvent.click(screen.getByRole('button', { name: /trash/i }))
    expect(screen.queryByText('Test Skill')).not.toBeInTheDocument()
  })

  it('handles Enter key to add skill', () => {
    renderComponent()
    
    const input = screen.getByPlaceholderText('Enter skill')
    fireEvent.change(input, { target: { value: 'Test Skill' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(screen.getByText('Test Skill')).toBeInTheDocument()
  })

  it('handles notes input', () => {
    renderComponent()
    
    const notesInput = screen.getByPlaceholderText('Describe how this affected you...')
    fireEvent.change(notesInput, { target: { value: 'Using this skill helped me cope better' } })
    
    expect(notesInput).toHaveValue('Using this skill helped me cope better')
  })
}) 