/**
 * Simple LRU (Least Recently Used) Cache implementation
 * Prevents memory leaks by limiting cache size
 */
export class LRUCache<T> {
  private cache: Map<string, T>
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: string, value: T): void {
    // Remove if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    
    // Add to end
    this.cache.set(key, value)
    
    // Remove oldest if over limit
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }

  // Get all entries (for compatibility)
  entries(): Record<string, T> {
    const result: Record<string, T> = {}
    this.cache.forEach((value, key) => {
      result[key] = value
    })
    return result
  }
}