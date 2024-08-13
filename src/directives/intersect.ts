import { DirectiveBinding } from 'vue'

/**
 * As directives are called multiple times during the element mount process,
 * we only keep one instance of observer for each element to avoid multiple
 * observer watching and calling the same callback multiple times
 */
const observers: Record<string, IntersectionObserver | undefined> = {}

const options = {
  root: null,
  rootMargin: '50px',
  threshold: 0.5
}

/**
 * Attach a callback function when a DOM element intersect
 * @param el Dom element intersected
 * @param binding Embedded callback function called on intersect
 */
export const intersect = (el: HTMLElement, binding: DirectiveBinding<() => void>) => {
  // Deactivate old observer
  const oldObserver = observers[el.id]
  oldObserver?.disconnect()

  console.debug(`Initializing observer for ${el.id}`)

  const handleIntersect = (entries: IntersectionObserverEntry[]) => {
    if (!entries.length) {
      return
    }

    const entry = entries[0]
    // Remove parasite event call when element is clearly visible during component mount part
    if (entry.isIntersecting && entry.time > 2_000) {
      const callBack = binding.value
      console.debug(`Calling ${callBack.name} for element ${el.id}`)
      callBack()
    }
  }
  const observer = new IntersectionObserver((entries) => handleIntersect(entries), options)
  observer.observe(el)

  observers[el.id] = observer
}
