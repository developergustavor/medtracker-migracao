import { useState, useCallback } from 'react'

const _loc = '@/pages/cadastros/editor/useElementTree'

export type TreeNode = {
  id: string
  element: HTMLElement
  tagName: string
  label: string
  variablePath?: string
  locked: boolean
  children: TreeNode[]
  collapsed: boolean
}

let nodeIdCounter = 0
function generateNodeId(): string {
  return `node-${++nodeIdCounter}`
}

function getElementLabel(el: HTMLElement): string {
  const variavel = el.getAttribute('nome-variavel')
  if (variavel) {
    const path = variavel.replace(/@@/g, '')
    return path.split('.').pop() || 'Variable'
  }
  if (el.tagName === 'IMG') return `img${el.getAttribute('src')?.includes('qr_code') ? ' (QR)' : ''}`
  if (el.className && typeof el.className === 'string') {
    const cls = el.className.split(' ')[0]
    if (cls) return `${el.tagName.toLowerCase()}.${cls}`
  }
  const text = el.textContent?.trim().slice(0, 20)
  if (text) return `${el.tagName.toLowerCase()} "${text}"`
  return el.tagName.toLowerCase()
}

function buildTreeFromElement(el: HTMLElement, depth: number = 0): TreeNode | null {
  // Skip script/style/meta elements
  if (['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD'].includes(el.tagName)) return null

  const children: TreeNode[] = []
  if (depth < 10) {
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement
      const node = buildTreeFromElement(child, depth + 1)
      if (node) children.push(node)
    }
  }

  return {
    id: el.dataset.nodeId || generateNodeId(),
    element: el,
    tagName: el.tagName.toLowerCase(),
    label: getElementLabel(el),
    variablePath: el.getAttribute('nome-variavel')?.replace(/@@/g, '') || undefined,
    locked: el.dataset.locked === 'true',
    children,
    collapsed: depth > 2
  }
}

export function useElementTree(iframeRef: React.RefObject<HTMLIFrameElement | null>) {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set())

  const refresh = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) { setTree([]); return }
    const body = iframe.contentDocument.body
    if (!body) { setTree([]); return }

    const nodes: TreeNode[] = []
    for (let i = 0; i < body.children.length; i++) {
      const child = body.children[i] as HTMLElement
      const node = buildTreeFromElement(child)
      if (node) nodes.push(node)
    }
    setTree(nodes)
  }, [iframeRef])

  const toggleLock = useCallback((nodeId: string) => {
    setLockedIds(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  }, [])

  const toggleCollapse = useCallback((nodeId: string) => {
    setTree(prev => {
      const toggle = (nodes: TreeNode[]): TreeNode[] =>
        nodes.map(n => n.id === nodeId
          ? { ...n, collapsed: !n.collapsed }
          : { ...n, children: toggle(n.children) }
        )
      return toggle(prev)
    })
  }, [])

  const isLocked = useCallback((nodeId: string) => lockedIds.has(nodeId), [lockedIds])

  const deleteNode = useCallback((node: TreeNode) => {
    if (node.locked) return
    node.element.remove()
    refresh()
  }, [refresh])

  const duplicateNode = useCallback((node: TreeNode) => {
    const clone = node.element.cloneNode(true) as HTMLElement
    clone.removeAttribute('data-node-id')
    node.element.parentElement?.insertBefore(clone, node.element.nextSibling)
    refresh()
  }, [refresh])

  const renameNode = useCallback((nodeId: string, newLabel: string) => {
    setTree(prev => {
      const rename = (nodes: TreeNode[]): TreeNode[] =>
        nodes.map(n => n.id === nodeId
          ? { ...n, label: newLabel }
          : { ...n, children: rename(n.children) }
        )
      return rename(prev)
    })
  }, [])

  const groupNodes = useCallback((elements: HTMLElement[]) => {
    if (elements.length < 2) return
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    const doc = iframe.contentDocument
    const parent = elements[0].parentElement
    if (!parent) return

    const group = doc.createElement('div')
    group.className = 'group'
    group.style.cssText = 'display:flex;flex-direction:column;position:relative;'
    group.dataset.nodeId = generateNodeId()

    parent.insertBefore(group, elements[0])
    elements.forEach(el => group.appendChild(el))
    refresh()
  }, [iframeRef, refresh])

  const ungroupNode = useCallback((node: TreeNode) => {
    const el = node.element
    if (!el.classList.contains('group')) return
    const parent = el.parentElement
    if (!parent) return

    while (el.firstChild) {
      parent.insertBefore(el.firstChild, el)
    }
    el.remove()
    refresh()
  }, [refresh])

  return {
    tree,
    refresh,
    toggleLock,
    toggleCollapse,
    isLocked,
    deleteNode,
    duplicateNode,
    renameNode,
    groupNodes,
    ungroupNode
  }
}
