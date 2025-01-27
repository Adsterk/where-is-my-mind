import { renderToString } from 'react-dom/server'
import { render } from '@testing-library/react'
import React from 'react'

export function testHydration(Component: React.ComponentType<any>, props: any) {
  const serverHTML = renderToString(React.createElement(Component, props))
  const { container } = render(React.createElement(Component, props))
  
  const serverTree = normalizeHTML(serverHTML)
  const clientTree = normalizeHTML(container.innerHTML)
  
  return {
    matches: serverTree === clientTree,
    serverTree,
    clientTree
  }
}

function normalizeHTML(html: string) {
  return html
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
} 