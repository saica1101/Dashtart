'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Pin, Edit2, Trash2, Plus, X, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Note } from '@/hooks/useDashboard'

interface NoteWidgetProps {
  theme: 'light' | 'dark'
  searchQuery: string
  notes: Note[]
  isStreaming: boolean
  actions: {
    addNote: (title: string, content: string, hideOnStream: boolean) => void
    removeNote: (id: string) => void
    updateNote: (id: string, title: string, content: string, hideOnStream: boolean) => void
    togglePinNote: (id: string) => void
    toggleNoteHide: (id: string) => void
    updateNotes: (notes: Note[]) => void
  }
}

export function NoteWidget({ 
  theme, 
  searchQuery, 
  notes, 
  isStreaming,
  actions 
}: NoteWidgetProps) {
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteHideOnStream, setNewNoteHideOnStream] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)

  const getContrastTextColor = (backgroundColor: string): string => {
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#ffffff'
  }

  const handleAddNote = () => {
    if (newNoteTitle || newNoteContent) {
      actions.addNote(newNoteTitle, newNoteContent, newNoteHideOnStream)
      setNewNoteTitle('')
      setNewNoteContent('')
      setNewNoteHideOnStream(false)
      setShowNoteForm(false)
    }
  }

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id)
    setNewNoteTitle(note.title)
    setNewNoteContent(note.content)
    setNewNoteHideOnStream(note.hideOnStream || false)
    setShowNoteForm(true)
  }

  const handleUpdateNote = () => {
    if (editingNoteId && (newNoteTitle || newNoteContent)) {
      actions.updateNote(editingNoteId, newNoteTitle, newNoteContent, newNoteHideOnStream)
      setNewNoteTitle('')
      setNewNoteContent('')
      setNewNoteHideOnStream(false)
      setShowNoteForm(false)
      setEditingNoteId(null)
    }
  }

  const cancelNoteEdit = () => {
    setNewNoteTitle('')
    setNewNoteContent('')
    setNewNoteHideOnStream(false)
    setShowNoteForm(false)
    setEditingNoteId(null)
  }

  const handleNoteDragStart = (id: string) => {
    setDraggedNoteId(id)
  }

  const handleNoteDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleNoteDrop = (targetId: string) => {
    if (!draggedNoteId || draggedNoteId === targetId) return

    const draggedNote = notes.find(n => n.id === draggedNoteId)
    const targetNote = notes.find(n => n.id === targetId)
    
    if (!draggedNote || !targetNote) return
    if (draggedNote.pinned !== targetNote.pinned) return

    const draggedIndex = notes.findIndex(n => n.id === draggedNoteId)
    const targetIndex = notes.findIndex(n => n.id === targetId)

    const newNotes = [...notes]
    const [draggedItem] = newNotes.splice(draggedIndex, 1)
    newNotes.splice(targetIndex, 0, draggedItem)

    actions.updateNotes(newNotes)
    setDraggedNoteId(null)
  }

  const filteredNotes = notes.filter(note => {
    if (isStreaming && note.hideOnStream) return false
    if (searchQuery) {
      return (
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return true
  })

  const filteredPinnedNotes = filteredNotes.filter(note => note.pinned)
  const filteredUnpinnedNotes = filteredNotes.filter(note => !note.pinned)

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-balance">Note</h2>
      
      {searchQuery && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <div className="text-sm">
            <span className="font-semibold">{filteredNotes.length}</span> 件の結果が見つかりました
          </div>
        </Card>
      )}

      {!showNoteForm ? (
        <Button 
          onClick={() => setShowNoteForm(true)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          新しいメモを追加
        </Button>
      ) : (
        <Card className="p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingNoteId ? 'メモを編集' : '新しいメモを追加'}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelNoteEdit}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="タイトル"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className="text-lg font-semibold"
            />
            <textarea
              placeholder="メモの内容を入力..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full min-h-[150px] p-3 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
            <div className="flex items-center space-x-2 py-2">
              <Checkbox 
                id="note-hide-stream" 
                checked={newNoteHideOnStream}
                onCheckedChange={(checked) => setNewNoteHideOnStream(checked as boolean)}
              />
              <Label htmlFor="note-hide-stream" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                配信モード中は非表示にする
              </Label>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={editingNoteId ? handleUpdateNote : handleAddNote} 
                className="flex-1"
                id="note_add"
              >
                {editingNoteId ? '更新' : '追加'}
              </Button>
              <Button 
                onClick={cancelNoteEdit} 
                className="flex-1"
                id="note_cancel"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      )}

      {filteredNotes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground mb-4">
            {searchQuery 
              ? '検索結果が見つかりませんでした' 
              : 'まだメモが作成されていません'
            }
          </div>
          {!searchQuery && (
            <Button onClick={() => setShowNoteForm(true)}>
              最初のメモを作成
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPinnedNotes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                ピン留め済み
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {filteredPinnedNotes.map((note) => {
                    const cardBgColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : note.color
                    const textColor = theme === 'dark' ? 'inherit' : getContrastTextColor(note.color)
                    
                    return (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card 
                          className={cn(
                            "p-4 group relative hover:shadow-lg transition-all min-h-[200px] flex flex-col cursor-move",
                            draggedNoteId === note.id && "opacity-50 scale-95 ring-2 ring-primary",
                            note.hideOnStream && !isStreaming && "ring-1 ring-dashed ring-muted-foreground/50"
                          )}
                          style={{ backgroundColor: cardBgColor }}
                          draggable
                          onDragStart={() => handleNoteDragStart(note.id)}
                          onDragOver={handleNoteDragOver}
                          onDrop={() => handleNoteDrop(note.id)}
                        >
                          <div className="flex-1" style={{ color: textColor }}>
                            {note.title && (
                              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                                {note.title}
                              </h3>
                            )}
                            <p className="text-sm whitespace-pre-wrap line-clamp-6">
                              {note.content}
                            </p>
                          </div>
                          
                          {note.hideOnStream && (
                            <div className="absolute bottom-2 right-2 opacity-50" title="配信モード中は非表示">
                              <EyeOff className="h-4 w-4" style={{ color: textColor }} />
                            </div>
                          )}

                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-6 w-6", note.pinned && "opacity-100")}
                              style={{ color: textColor }}
                              onClick={() => actions.togglePinNote(note.id)}
                              title={note.pinned ? "ピン留めを解除" : "ピン留めする"}
                            >
                              <Pin className={cn("h-3 w-3", note.pinned && "fill-current")} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-6 w-6", note.hideOnStream && "opacity-100")}
                              style={{ color: textColor }}
                              onClick={() => actions.toggleNoteHide(note.id)}
                              title={note.hideOnStream ? "配信時に表示する" : "配信時に隠す"}
                            >
                              <EyeOff className={cn("h-3 w-3", note.hideOnStream && "text-red-500")} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              style={{ color: textColor }}
                              onClick={() => startEditingNote(note)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              style={{ color: textColor }}
                              onClick={() => actions.removeNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {filteredUnpinnedNotes.length > 0 && (
            <div>
              {filteredPinnedNotes.length > 0 && (
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                  その他
                </h3>
              )}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {filteredUnpinnedNotes.map((note) => {
                    const cardBgColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : note.color
                    const textColor = theme === 'dark' ? 'inherit' : getContrastTextColor(note.color)
                    
                    return (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card 
                          className={cn(
                            "p-4 group relative hover:shadow-lg transition-all min-h-[200px] flex flex-col cursor-move",
                            draggedNoteId === note.id && "opacity-50 scale-95 ring-2 ring-primary",
                            note.hideOnStream && !isStreaming && "ring-1 ring-dashed ring-muted-foreground/50"
                          )}
                          style={{ backgroundColor: cardBgColor }}
                          draggable
                          onDragStart={() => handleNoteDragStart(note.id)}
                          onDragOver={handleNoteDragOver}
                          onDrop={() => handleNoteDrop(note.id)}
                        >
                          <div className="flex-1" style={{ color: textColor }}>
                            {note.title && (
                              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                                {note.title}
                              </h3>
                            )}
                            <p className="text-sm whitespace-pre-wrap line-clamp-6">
                              {note.content}
                            </p>
                          </div>

                          {note.hideOnStream && (
                            <div className="absolute bottom-2 right-2 opacity-50" title="配信モード中は非表示">
                              <EyeOff className="h-4 w-4" style={{ color: textColor }} />
                            </div>
                          )}

                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-6 w-6", note.pinned && "opacity-100")}
                              style={{ color: textColor }}
                              onClick={() => actions.togglePinNote(note.id)}
                              title={note.pinned ? "ピン留めを解除" : "ピン留めする"}
                            >
                              <Pin className={cn("h-3 w-3", note.pinned && "fill-current")} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-6 w-6", note.hideOnStream && "opacity-100")}
                              style={{ color: textColor }}
                              onClick={() => actions.toggleNoteHide(note.id)}
                              title={note.hideOnStream ? "配信時に表示する" : "配信時に隠す"}
                            >
                              <EyeOff className={cn("h-3 w-3", note.hideOnStream && "text-red-500")} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              style={{ color: textColor }}
                              onClick={() => startEditingNote(note)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              style={{ color: textColor }}
                              onClick={() => actions.removeNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
