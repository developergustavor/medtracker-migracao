import { useState, useCallback } from 'react'

const _loc = '@/pages/cadastros/editor/useCommandStack'

type Command = {
  execute: () => void
  undo: () => void
  description: string
}

export function useCommandStack(maxHistory: number = 50) {
  const [undoStack, setUndoStack] = useState<Command[]>([])
  const [redoStack, setRedoStack] = useState<Command[]>([])

  const execute = useCallback((command: Command) => {
    command.execute()
    setUndoStack(prev => [...prev.slice(-maxHistory + 1), command])
    setRedoStack([])
  }, [maxHistory])

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev
      const cmd = prev[prev.length - 1]
      cmd.undo()
      setRedoStack(r => [...r, cmd])
      return prev.slice(0, -1)
    })
  }, [])

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev
      const cmd = prev[prev.length - 1]
      cmd.execute()
      setUndoStack(u => [...u, cmd])
      return prev.slice(0, -1)
    })
  }, [])

  return {
    execute,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoCount: undoStack.length,
    redoCount: redoStack.length
  }
}
