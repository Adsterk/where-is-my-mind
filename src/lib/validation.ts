export const validateTimeFormat = (time: string): boolean => {
  // Basic time format validation (HH:mm or HH:mm:ss)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
  return timeRegex.test(time)
}

export const validateDuration = (minutes: number): boolean => {
  return typeof minutes === 'number' && minutes > 0
}

export const validateIntensity = (rating: number): boolean => {
  return typeof rating === 'number' && rating >= 1 && rating <= 5
}

export const validateEffectiveness = (rating: number): boolean => {
  return typeof rating === 'number' && rating >= 1 && rating <= 5
}

export const validateDifficulty = (rating: number): boolean => {
  return typeof rating === 'number' && rating >= 1 && rating <= 5
}

export const validateQualityRating = (rating: number): boolean => {
  return typeof rating === 'number' && rating >= 1 && rating <= 5
}

export const validateImpactRating = (rating: number): boolean => {
  return typeof rating === 'number' && rating >= 1 && rating <= 5
}

export const validateMoodScore = (score: number): boolean => {
  return typeof score === 'number' && score >= 1 && score <= 10
}

export const sanitizeText = (text: string): string => {
  return text.trim()
}

export const validateSleepHours = (hours: number): boolean => {
  return !isNaN(hours) && hours >= 0 && hours <= 24
}

export const validateSleepQuality = (quality: number): boolean => {
  return !isNaN(quality) && quality >= 1 && quality <= 5
}

export const validateFulfillment = (rating: number): boolean => {
  return !isNaN(rating) && rating >= 1 && rating <= 5
} 