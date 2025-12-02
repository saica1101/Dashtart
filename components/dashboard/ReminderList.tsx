'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Plus, Trash2, Radio, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Reminder } from '@/hooks/useDashboard'

interface ReminderListProps {
  isStreaming: boolean
  searchQuery: string
  reminders: Reminder[]
  actions: {
    addReminder: (text: string, time: string, hideOnStream: boolean) => void
    toggleReminder: (id: string) => void
    removeReminder: (id: string) => void
    toggleReminderHide: (id: string) => void
    updateReminders: (reminders: Reminder[]) => void
  }
}

export function ReminderList({ 
  isStreaming, 
  searchQuery, 
  reminders, 
  actions 
}: ReminderListProps) {
  const [newReminderText, setNewReminderText] = useState('')
  const [newReminderTime, setNewReminderTime] = useState('')
  const [newReminderHideOnStream, setNewReminderHideOnStream] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [draggedReminderId, setDraggedReminderId] = useState<string | null>(null)

  const handleAddReminder = () => {
    if (newReminderText) {
      actions.addReminder(newReminderText, newReminderTime, newReminderHideOnStream)
      setNewReminderText('')
      setNewReminderTime('')
      setNewReminderHideOnStream(false)
      setShowReminderForm(false)
    }
  }

  const handleReminderDragStart = (id: string) => {
    setDraggedReminderId(id)
  }

  const handleReminderDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleReminderDrop = (targetId: string) => {
    if (!draggedReminderId || draggedReminderId === targetId) return

    const draggedIndex = reminders.findIndex(r => r.id === draggedReminderId)
    const targetIndex = reminders.findIndex(r => r.id === targetId)

    const newReminders = [...reminders]
    const [draggedItem] = newReminders.splice(draggedIndex, 1)
    newReminders.splice(targetIndex, 0, draggedItem)

    actions.updateReminders(newReminders)
    setDraggedReminderId(null)
  }

  const filteredReminders = searchQuery
    ? reminders.filter(reminder => reminder.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : (isStreaming ? reminders.filter(reminder => !reminder.hideOnStream) : reminders)

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-balance">Reminder</h2>
      {searchQuery && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <div className="text-sm">
            <span className="font-semibold">{filteredReminders.length}</span> 件の結果が見つかりました
          </div>
        </Card>
      )}

      {!showReminderForm ? (
        <Button 
          onClick={() => setShowReminderForm(true)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          新しいリマインダーを追加
        </Button>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">新しいリマインダーを追加</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReminderForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="リマインダーの内容"
              value={newReminderText}
              onChange={(e) => setNewReminderText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddReminder()}
            />
            <div className="flex gap-3">
              <Input
                type="time"
                placeholder="通知時刻 (オプション)"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="flex-1"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newReminderHideOnStream}
                onChange={(e) => setNewReminderHideOnStream(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm">配信中は非表示にする</span>
            </label>
            <Button onClick={handleAddReminder} id="add_reminder">
              <Plus className="h-4 w-4 mr-2" />
              追加
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              {searchQuery 
                ? '検索結果が見つかりませんでした' 
                : 'まだリマインダーが登録されていません'
              }
            </div>
            {!searchQuery && (
              <Button onClick={() => setShowReminderForm(true)}>
                リマインダーを追加
              </Button>
            )}
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredReminders.map((reminder) => (
              <motion.div
                key={reminder.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={cn(
                    "p-4 group hover:shadow-lg transition-shadow cursor-move",
                    draggedReminderId === reminder.id && "opacity-50 scale-95 ring-2 ring-primary"
                  )}
                  draggable
                  onDragStart={() => handleReminderDragStart(reminder.id)}
                  onDragOver={handleReminderDragOver}
                  onDrop={() => handleReminderDrop(reminder.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={reminder.completed}
                      onChange={() => actions.toggleReminder(reminder.id)}
                      className="h-5 w-5 rounded border-border cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className={cn('block', reminder.completed && 'line-through text-muted-foreground')}>
                        {reminder.text}
                      </span>
                      {reminder.time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Bell className="h-3 w-3" />
                          {reminder.time}
                        </div>
                      )}
                    </div>
                    {reminder.hideOnStream && (
                      <Radio className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8",
                          reminder.hideOnStream && "text-red-500"
                        )}
                        onClick={() => actions.toggleReminderHide(reminder.id)}
                        title={reminder.hideOnStream ? "配信中に表示する" : "配信中に非表示にする"}
                      >
                        <Radio className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => actions.removeReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
