'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Trash2, Radio, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Category, QuickPage } from '@/hooks/useDashboard'

interface QuickLinksProps {
  isStreaming: boolean
  searchQuery: string
  categories: Category[]
  activeCategory: string
  quickPages: QuickPage[]
  actions: {
    setActiveCategory: (id: string) => void
    addQuickPage: (name: string, url: string, hideOnStream: boolean, categoryId: string) => void
    removeQuickPage: (id: string) => void
    toggleQuickPageHide: (id: string) => void
    updateQuickPages: (pages: QuickPage[]) => void
    addCategory: () => void
    removeCategory: (id: string) => void
    updateCategory: (id: string, name: string) => void
    updateCategories: (categories: Category[]) => void
  }
}

export function QuickLinks({ 
  isStreaming, 
  searchQuery, 
  categories, 
  activeCategory, 
  quickPages, 
  actions 
}: QuickLinksProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  
  const [newPageName, setNewPageName] = useState('')
  const [newPageUrl, setNewPageUrl] = useState('')
  const [newPageHideOnStream, setNewPageHideOnStream] = useState(false)
  const [newPageCategoryId, setNewPageCategoryId] = useState('default')
  const [showQuickPageForm, setShowQuickPageForm] = useState(false)
  
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)

  const handleAddQuickPage = () => {
    if (newPageName && newPageUrl) {
      actions.addQuickPage(newPageName, newPageUrl, newPageHideOnStream, newPageCategoryId)
      setNewPageName('')
      setNewPageUrl('')
      setNewPageHideOnStream(false)
      setNewPageCategoryId('default')
      setShowQuickPageForm(false)
    }
  }

  const handleAddCategory = () => {
    actions.addCategory()
  }

  const startEditingCategory = (categoryId: string, name: string) => {
    if (categoryId === 'default') return
    setEditingCategoryId(categoryId)
    setEditingCategoryName(name)
  }

  const saveCategory = () => {
    if (editingCategoryId && editingCategoryName.trim()) {
      actions.updateCategory(editingCategoryId, editingCategoryName)
    }
    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const handleCategoryDragStart = (categoryId: string) => {
    setDraggedCategoryId(categoryId)
  }

  const handleCategoryDragEnd = () => {
    setDraggedCategoryId(null)
  }

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()

    if (draggedCategoryId) {
      if (draggedCategoryId === targetCategoryId) {
        setDraggedCategoryId(null)
        return
      }

      const updated = [...categories]
      const draggedIndex = updated.findIndex(cat => cat.id === draggedCategoryId)
      const targetIndex = updated.findIndex(cat => cat.id === targetCategoryId)

      if (draggedIndex === -1 || targetIndex === -1) return

      const [moved] = updated.splice(draggedIndex, 1)
      updated.splice(targetIndex, 0, moved)
      
      actions.updateCategories(updated)
      setDraggedCategoryId(null)
      return
    }

    if (!draggedItemId) return

    const newPages = quickPages.map(page => 
      page.id === draggedItemId ? { ...page, categoryId: targetCategoryId } : page
    )
    actions.updateQuickPages(newPages)
    setDraggedItemId(null)
  }

  const handleDragStart = (id: string) => {
    setDraggedItemId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetId: string) => {
    if (!draggedItemId || draggedItemId === targetId) return

    const draggedPage = quickPages.find(p => p.id === draggedItemId)
    const targetPage = quickPages.find(p => p.id === targetId)
    
    if (!draggedPage || !targetPage) return
    if (draggedPage.categoryId !== targetPage.categoryId) return

    const draggedIndex = quickPages.findIndex(p => p.id === draggedItemId)
    const targetIndex = quickPages.findIndex(p => p.id === targetId)

    const newPages = [...quickPages]
    const [draggedItem] = newPages.splice(draggedIndex, 1)
    newPages.splice(targetIndex, 0, draggedItem)

    actions.updateQuickPages(newPages)
    setDraggedItemId(null)
  }

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'default') {
      return quickPages.length
    }
    return quickPages.filter(page => page.categoryId === categoryId).length
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return '/placeholder.svg?height=32&width=32'
    }
  }

  const quickPagesByMode = isStreaming
    ? quickPages.filter(page => !page.hideOnStream)
    : quickPages

  const quickPagesInActiveCategory = activeCategory === 'default'
    ? quickPagesByMode
    : quickPagesByMode.filter(page => page.categoryId === activeCategory)

  const filteredQuickPages = searchQuery
    ? quickPagesInActiveCategory.filter(page => page.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : quickPagesInActiveCategory

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-balance">Quick Pages</h2>
      {searchQuery && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <div className="text-sm">
            <span className="font-semibold">{filteredQuickPages.length}</span> 件の結果が見つかりました
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        {!showQuickPageForm ? (
          <Button 
            onClick={() => setShowQuickPageForm(true)}
            size="lg"
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-5 w-5 mr-2" />
            新しいページを追加
          </Button>
        ) : null}
      </div>

      {showQuickPageForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">新しいページを追加</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuickPageForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="ページ名"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="URL"
                value={newPageUrl}
                onChange={(e) => setNewPageUrl(e.target.value)}
                className="flex-1"
              />
            </div>
            <select
              value={newPageCategoryId}
              onChange={(e) => setNewPageCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newPageHideOnStream}
                onChange={(e) => setNewPageHideOnStream(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm">配信中は非表示にする</span>
            </label>
            <Button onClick={handleAddQuickPage} className="sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              追加
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="relative group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleCategoryDrop(e, category.id)}
          >
            {editingCategoryId === category.id ? (
              <div className="flex items-center gap-1 bg-background border border-border rounded-lg px-3 py-2">
                <Input
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && saveCategory()}
                  className="h-7 w-32 text-sm"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={saveCategory}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant={activeCategory === category.id ? "default" : "ghost"}
                className={cn(
                  "relative px-4 py-2 rounded-t-lg rounded-b-none",
                  activeCategory === category.id && "bg-primary text-primary-foreground",
                  draggedCategoryId === category.id && "opacity-60"
                )}
                onClick={() => actions.setActiveCategory(category.id)}
                draggable
                onDragStart={() => handleCategoryDragStart(category.id)}
                onDragEnd={handleCategoryDragEnd}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-70">
                  ({getCategoryCount(category.id)})
                </span>
                {category.id !== 'default' && (
                  <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-md shadow-lg">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditingCategory(category.id, category.name)
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        actions.removeCategory(category.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </Button>
            )}
          </div>
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 border border-dashed border-border"
              onClick={handleAddCategory}
              aria-label="カテゴリを追加"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            カテゴリを作成
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredQuickPages.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery 
              ? '検索結果が見つかりませんでした' 
              : 'このカテゴリにはまだページがありません'
            }
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredQuickPages.map((page) => (
              <motion.div
                key={page.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={cn(
                    "p-4 group relative hover:shadow-lg transition-all hover:scale-105 cursor-move",
                    draggedItemId === page.id && "opacity-50 scale-95 ring-2 ring-primary"
                  )}
                  draggable
                  onDragStart={() => handleDragStart(page.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(page.id)}
                >
                  <button
                    onClick={() => window.open(page.url, '_blank')}
                    className="w-full flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center shadow-sm">
                      <img 
                        src={getFaviconUrl(page.url) || "/placeholder.svg"} 
                        alt={page.name}
                        className="w-8 h-8"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.svg?height=32&width=32'
                        }}
                      />
                    </div>
                    <div className="text-sm font-medium text-center line-clamp-2 w-full">
                      {page.name}
                    </div>
                  </button>
                  {page.hideOnStream && (
                    <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                      <Radio className="h-3 w-3" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6",
                        page.hideOnStream && "text-red-500"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        actions.toggleQuickPageHide(page.id)
                      }}
                      title={page.hideOnStream ? "配信中に表示する" : "配信中に非表示にする"}
                    >
                      <Radio className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => actions.removeQuickPage(page.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
