import { render, screen, fireEvent } from '@testing-library/react'
import { TestSleepScore } from './TestSleepScore'
import { TestMoodEntryWrapper } from './TestWrapper'

describe('TestSleepScore', () => {
  const renderComponent = (props = {}) => {
    return render(
      <TestMoodEntryWrapper>
        <TestSleepScore {...props} />
      </TestMoodEntryWrapper>
    )
  }

  it('renders with default values', () => {
    renderComponent()
    
    expect(screen.getByText('Sleep Duration')).toBeInTheDocument()
    expect(screen.getByText('7 Hours')).toBeInTheDocument()
    expect(screen.getByText('Fair')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe how this score affected you...')).toBeInTheDocument()
  })

  it('handles hours changes', () => {
    const onScoreChange = jest.fn()
    renderComponent({ onScoreChange })
    
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '9' } })
    
    expect(screen.getByText('9 Hours')).toBeInTheDocument()
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(onScoreChange).toHaveBeenCalledWith(9)
  })

  it('shows correct quality labels', () => {
    renderComponent({ defaultValue: 3 })
    expect(screen.getByText('Very Poor')).toBeInTheDocument()
    
    const slider = screen.getByRole('slider')
    
    fireEvent.change(slider, { target: { value: '5' } })
    expect(screen.getByText('Poor')).toBeInTheDocument()
    
    fireEvent.change(slider, { target: { value: '7' } })
    expect(screen.getByText('Fair')).toBeInTheDocument()
    
    fireEvent.change(slider, { target: { value: '9' } })
    expect(screen.getByText('Good')).toBeInTheDocument()
    
    fireEvent.change(slider, { target: { value: '11' } })
    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('applies correct color classes based on hours', () => {
    const { rerender } = renderComponent({ defaultValue: 3 })
    expect(screen.getByRole('slider').parentElement).toHaveClass('bg-red-500')
    
    rerender(
      <TestMoodEntryWrapper>
        <TestSleepScore defaultValue={5} />
      </TestMoodEntryWrapper>
    )
    expect(screen.getByRole('slider').parentElement).toHaveClass('bg-orange-500')
    
    rerender(
      <TestMoodEntryWrapper>
        <TestSleepScore defaultValue={7} />
      </TestMoodEntryWrapper>
    )
    expect(screen.getByRole('slider').parentElement).toHaveClass('bg-yellow-500')
    
    rerender(
      <TestMoodEntryWrapper>
        <TestSleepScore defaultValue={9} />
      </TestMoodEntryWrapper>
    )
    expect(screen.getByRole('slider').parentElement).toHaveClass('bg-green-500')
    
    rerender(
      <TestMoodEntryWrapper>
        <TestSleepScore defaultValue={11} />
      </TestMoodEntryWrapper>
    )
    expect(screen.getByRole('slider').parentElement).toHaveClass('bg-emerald-500')
  })

  it('handles notes input', () => {
    renderComponent()
    
    const notesInput = screen.getByPlaceholderText('Describe how this score affected you...')
    fireEvent.change(notesInput, { target: { value: 'Slept well after exercise' } })
    
    expect(notesInput).toHaveValue('Slept well after exercise')
  })
}) 