'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MailService } from '@/hooks/useDashboard'

interface MailWidgetProps {
  mailServices: MailService[]
  actions: {
    addMailService: (name: string, url: string) => void
    removeMailService: (id: string) => void
  }
}

export function MailWidget({ mailServices, actions }: MailWidgetProps) {
  const [newMailName, setNewMailName] = useState('')
  const [newMailUrl, setNewMailUrl] = useState('')
  const [showMailForm, setShowMailForm] = useState(false)

  const handleAddMailService = () => {
    if (newMailName && newMailUrl) {
      actions.addMailService(newMailName, newMailUrl)
      setNewMailName('')
      setNewMailUrl('')
      setShowMailForm(false)
    }
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return '/placeholder.svg?height=32&width=32'
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-balance">Mail</h2>
      
      {!showMailForm ? (
        <Button 
          onClick={() => setShowMailForm(true)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          新しいメールサービスを追加
        </Button>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">新しいメールサービスを追加</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMailForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="サービス名 (例: Gmail, Outlook)"
                value={newMailName}
                onChange={(e) => setNewMailName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="URL (例: https://mail.google.com)"
                value={newMailUrl}
                onChange={(e) => setNewMailUrl(e.target.value)}
                className="flex-1"
              />
            </div>
              <Button onClick={handleAddMailService} id="add_mail_service">
                <Plus className="h-4 w-4 mr-2" />
                追加
              </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {mailServices.map((mail) => (
            <motion.div
              key={mail.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="p-4 group relative hover:shadow-lg transition-all hover:scale-105"
              >
                <button
                  onClick={() => window.open(mail.url, '_blank')}
                  className="w-full flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center shadow-sm">
                    <img 
                      src={getFaviconUrl(mail.url) || "/placeholder.svg"} 
                      alt={mail.name}
                      className="w-8 h-8"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg?height=32&width=32'
                      }}
                    />
                  </div>
                  <div className="text-sm font-medium text-center line-clamp-2 w-full">
                    {mail.name}
                  </div>
                </button>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => actions.removeMailService(mail.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
