/**
 *  Chunk list into smaller lists
 * @example ([1, 2, 3, 4], chunkSize=2) => [[1, 2], [3, 4]]
 */
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const results: T[][] = []
  const copyArray = [...array]
  while (copyArray.length) {
    results.push(copyArray.splice(0, chunkSize))
  }
  return results
}

/**
 * Equivalent to Python list[start : stop : step]
 */
export const range = (start: number, stop: number, step = 1): number[] => {
  return Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
}

export const capitalize = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Equivalent to Python defaultdict(defaultValue)
 * @example
 *    const o = getDefaultMap(0)
 *    o.b = 1
 *    o.a
 *    ==> 0
 *    o.b
 *    ==> 1
 */
export const getDefaultMap = <T extends string, D>(defaultValue: D): Record<T, D> => {
  return new Proxy(
    ({} as Record<T, D>),
    {
      get: (target: Record<T, D>, name: T) => (name in target ? target[name] : defaultValue)
    }
  )
}
