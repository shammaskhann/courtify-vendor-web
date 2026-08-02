// Mock utility functions for simulating real API behavior

/**
 * Simulates network latency with a random delay between min and max ms.
 */
export function mockDelay(min = 600, max = 1200): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Randomly throws an error to simulate API failures during development.
 * @param failureRate - Probability of failure (0 to 1). Default is 0.1 (10%).
 */
export function mockError(failureRate = 0.1): void {
  if (Math.random() < failureRate) {
    throw new Error('Mock API Error: Something went wrong. Please try again.')
  }
}

/**
 * Generates a UUID-like string for mock data.
 */
export function mockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Paginates an array of items.
 */
export function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; page: number; pageSize: number } {
  const start = (page - 1) * pageSize
  return {
    data: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}
