export function validateTrackerProps(props: any) {
  if (!Array.isArray(props.items)) {
    throw new Error('items must be an array')
  }
  
  if (!Array.isArray(props.entries)) {
    throw new Error('entries must be an array')
  }
  
  if (typeof props.onUpdate !== 'function') {
    throw new Error('onUpdate must be a function')
  }
} 