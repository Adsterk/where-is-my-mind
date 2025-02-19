import { render, screen, fireEvent } from '@testing-library/react'
import { TestMoodScore } from './TestMoodScore'
import { TestMoodEntryWrapper } from './TestWrapper'

describe('TestMoodScore', () => {
  const renderComponent = (props = {}) => {
    return render(
      <TestMoodEntryWrapper>
        <TestMoodScore {...props} />
      </TestMoodEntryWrapper>
    )
  }

  it('renders with default values', () => {
    renderComponent()
    
    expect(screen.getByText('Mood Score')).toBeInTheDocument()
    expect(screen.getByText('5/10')).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()
    expect(screen.getByPlaceholderText('Describe how this score affected you...')).toBeInTheDocument()
  })

  it('handles score changes', () => {
    const onScoreChange = jest.fn()
    renderComponent({ onScoreChange })
    
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '7' } })
    
    expect(screen.getByText('7/10')).toBeInTheDocument()
    expect(onScoreChange).toHaveBeenCalledWith(7)
  })

  it('handles bipolar mode toggle', () => {
    const onBipolarChange = jest.fn()
    renderComponent({ onBipolarChange })
    
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    
    expect(toggle).toBeChecked()
    expect(onBipolarChange).toHaveBeenCalledWith(true)
    expect(screen.getByText('Balanced')).toBeInTheDocument()
  })

  it('shows correct labels in bipolar mode', () => {
    renderComponent({ defaultBipolar: true })
    
    expect(screen.getByText('Severe Depression')).toBeInTheDocument()
    expect(screen.getByText('Balanced')).toBeInTheDocument()
    expect(screen.getByText('Severe Mania')).toBeInTheDocument()
  })

  it('shows correct labels in standard mode', () => {
    renderComponent()
    
    expect(screen.getByText('Very Low')).toBeInTheDocument()
    expect(screen.getByText('Neutral')).toBeInTheDocument()
    expect(screen.getByText('Very Good')).toBeInTheDocument()
  })

  it('applies correct color classes based on score', () => {
    const { rerender } = renderComponent({ defaultValue: 2 })
    expect(screen.getByRole('slider').parentElement).toHaveClass('bg-red-500')
    
    rerender(
      <TestMoodEntryWrapper>
        <TestMoodScore defaultValue={6} />
      </TestMoodEntryWrapper>
    )
    expect(screen.getByRole('slider').parentElement).toHaveClass('bg-yellow-500')
    
    rerender(
      <TestMoodEntryWrapper>
        <TestMoodScore defaultValue={9} />
      </TestMoodEntryWrapper>
    )
    expect(screen.getByRole('slider').parentElement).toHaveClass('bg-green-500')
  })

  it('handles notes input', () => {
    renderComponent()
    
    const notesInput = screen.getByPlaceholderText('Describe how this score affected you...')
    fireEvent.change(notesInput, { target: { value: 'Feeling better today' } })
    
    expect(notesInput).toHaveValue('Feeling better today')
  })
}) 