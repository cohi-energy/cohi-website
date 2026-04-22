/**
 * Self-mounting island bundle for the marketing site.
 *
 * The static HTML places `<div data-cohi-card="cost"></div>` (etc.) wherever
 * an animated card scene should appear. On load we walk every such element
 * and render the picked React pattern into it. Cards added later (e.g. when
 * the user opens the resident/property-manager service grids in script.js)
 * are picked up by a MutationObserver, so the marketing JS doesn't need to
 * call us back.
 *
 * Exposes `window.CohiCards.mount(el, cardId)` for manual control if needed.
 */

import { createRoot, type Root } from 'react-dom/client'
import { PATTERN_BY_KEY } from './v2/fm/icon-flicker'
import { CARD_PICK } from './v2/tokens'

const ATTR = 'data-cohi-card'
const ROOT_KEY = '__cohiRoot'

interface MountedNode extends HTMLElement {
  [ROOT_KEY]?: Root
}

function renderInto(el: MountedNode, cardId: string) {
  const patternKey = CARD_PICK[cardId]
  if (!patternKey) {
    console.warn(`[CohiCards] No pick configured for card "${cardId}"`)
    return
  }
  const pattern = PATTERN_BY_KEY[patternKey]
  if (!pattern) {
    console.warn(`[CohiCards] Unknown pattern "${patternKey}" for card "${cardId}"`)
    return
  }
  const Component = pattern.map[cardId]
  if (!Component) {
    console.warn(`[CohiCards] Pattern "${patternKey}" has no implementation for card "${cardId}"`)
    return
  }
  let root = el[ROOT_KEY]
  if (!root) {
    root = createRoot(el)
    el[ROOT_KEY] = root
  }
  root.render(<Component />)
}

function mount(el: HTMLElement, cardId?: string) {
  const id = cardId ?? el.getAttribute(ATTR) ?? ''
  if (!id) return
  renderInto(el as MountedNode, id)
}

function scan(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>(`[${ATTR}]`).forEach((el) => {
    const node = el as MountedNode
    if (node[ROOT_KEY]) return
    const id = el.getAttribute(ATTR)
    if (id) renderInto(node, id)
  })
}

function unmountRemoved(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>(`[${ATTR}]`).forEach((el) => {
    const node = el as MountedNode
    if (!node.isConnected && node[ROOT_KEY]) {
      node[ROOT_KEY].unmount()
      delete node[ROOT_KEY]
    }
  })
}

function init() {
  scan()
  // Watch for nodes added or removed by other JS (e.g. the services panel)
  const observer = new MutationObserver((mutations) => {
    let needsScan = false
    let needsCleanup = false
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1) needsScan = true
      })
      m.removedNodes.forEach((n) => {
        if (n.nodeType === 1) needsCleanup = true
      })
    }
    if (needsScan) scan()
    if (needsCleanup) unmountRemoved()
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
  init()
}

const api = { mount, scan }

declare global {
  interface Window {
    CohiCards: typeof api
  }
}

window.CohiCards = api

export default api
