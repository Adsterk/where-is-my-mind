import type { TypedEntry } from '@/types/entries'

export function isTypedEntry<T extends TypedEntry>(
  entry: any,
  type: T['type']
): entry is T {
  return entry?.type === type
} 