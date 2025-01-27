import { renderToString } from 'react-dom/server'
import { render } from '@testing-library/react'
import TestMoodEntryForm from '../TestMoodEntryForm'
import { TestMoodAndNotesTracker } from '../test.specMoodAndNotesTracker'
import { TestSleepTracker } from '../test.specSleepTracker'
import { TestMedicationTracker } from '../test.specMedicationTracker'

describe('SSR Hydration Tests', () => {
  it('should match server and client rendering for MoodEntryForm', () => {
    const serverHTML = renderToString(<TestMoodEntryForm />)
    const { container } = render(<TestMoodEntryForm />)
    expect(container.innerHTML).toMatch(serverHTML)
  })

  // Test individual components
  const testCases = [
    {
      Component: TestMoodAndNotesTracker,
      props: {
        value: { mood_score: 7, notes: null, is_bipolar_scale: false },
        onUpdate: () => {}
      }
    },
    {
      Component: TestSleepTracker,
      props: {
        value: { sleep_hours: 8, sleep_quality: null },
        onUpdate: () => {}
      }
    },
    {
      Component: TestMedicationTracker,
      props: {
        medications: [],
        entries: [],
        onMedicationAdd: () => {},
        onEntryChange: () => {}
      }
    }
  ]

  testCases.forEach(({ Component, props }) => {
    it(`should match server and client rendering for ${Component.name}`, () => {
      const serverHTML = renderToString(<Component {...(props as any)} />)
      const { container } = render(<Component {...(props as any)} />)
      expect(container.innerHTML).toMatch(serverHTML)
    })
  })
}) 