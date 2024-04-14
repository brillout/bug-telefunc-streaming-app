// https://vike.dev/onRenderClient
export { onRenderClient }

import React from 'react'
import ReactDOM from 'react-dom/client'
import type { OnRenderClientAsync } from 'vike/types'

let root: ReactDOM.Root
const onRenderClient: OnRenderClientAsync = async (pageContext): ReturnType<OnRenderClientAsync> => {
  const { Page } = pageContext
  const page = (
    <Page />
  )
  const container = document.getElementById('react-root')!
  if (pageContext.isHydration) {
    root = ReactDOM.hydrateRoot(container, page)
  } else {
    if (!root) {
      root = ReactDOM.createRoot(container)
    }
    root.render(page)
  }
}
