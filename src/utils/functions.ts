
// Chunk list into smaller lists
export const chunkArray = <T>(array: Array<T>, chunkSize: number): Array<Array<T>> => {
  const results: Array<Array<T>> = []
  const copyArray = [...array]
  while (copyArray.length) {
    results.push(copyArray.splice(0, chunkSize))
  }
  return results
}

export const range = (start: number, stop: number, step = 1): number[] => {
  return Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
}

export const capitalize = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
