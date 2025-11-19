'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Moon, Sun, Menu, X, Plus, Trash2, Cloud, Radio, Bell, Edit2, Check, Settings, Pin, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchWeatherData } from '@/lib/weather'
import { motion, AnimatePresence } from 'framer-motion'

type QuickPage = {
  id: string
  name: string
  url: string
  hideOnStream: boolean
  categoryId: string
}

type Category = {
  id: string
  name: string
}


type Reminder = {
  id: string
  text: string
  completed: boolean
  time?: string
  hideOnStream: boolean
}

type MailService = {
  id: string
  name: string
  url: string
}

type WeatherData = {
  temp: number
  condition: string
  description: string
  precipitation: number // 降水確率を追加
}

type Note = {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean // ピン留め状態を追加
}

const getContrastTextColor = (backgroundColor: string): string => {
  // 16進数カラーコードをRGBに変換
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // 相対輝度を計算 (WCAG基準)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // 明るい背景には黒、暗い背景には白を返す
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<'dashboard' | 'quick-pages' | 'reminder' | 'mail' | 'note'>('dashboard')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [isStreaming, setIsStreaming] = useState(false)
  
  const [categories, setCategories] = useState<Category[]>([
    { id: 'default', name: 'すべて' }
  ])
  const [activeCategory, setActiveCategory] = useState('default')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  
  const [quickPages, setQuickPages] = useState<QuickPage[]>([
    { id: '1', name: 'Google', url: 'https://www.google.com', hideOnStream: false, categoryId: 'default' },
    { id: '2', name: 'GitHub', url: 'https://github.com', hideOnStream: false, categoryId: 'default' },
    { id: '3', name: 'YouTube', url: 'https://www.youtube.com', hideOnStream: false, categoryId: 'default' },
  ])
  const [newPageName, setNewPageName] = useState('')
  const [newPageUrl, setNewPageUrl] = useState('')
  const [newPageHideOnStream, setNewPageHideOnStream] = useState(false)
  const [newPageCategoryId, setNewPageCategoryId] = useState('default')
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
    const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
  
  
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', text: '会議に参加する', completed: false, time: '14:00', hideOnStream: false },
    { id: '2', text: 'プロジェクト資料を準備', completed: false, hideOnStream: false },
  ])
  const [newReminderText, setNewReminderText] = useState('')
  const [newReminderTime, setNewReminderTime] = useState('')
  const [newReminderHideOnStream, setNewReminderHideOnStream] = useState(false)
  const [draggedReminderId, setDraggedReminderId] = useState<string | null>(null)
  const [notifiedReminders, setNotifiedReminders] = useState<Set<string>>(new Set())
  
  const [mailServices, setMailServices] = useState<MailService[]>([
    { id: '1', name: 'Gmail', url: 'https://mail.google.com' },
  ])
  const [newMailName, setNewMailName] = useState('')
  const [newMailUrl, setNewMailUrl] = useState('')
  const [showMailForm, setShowMailForm] = useState(false)
  
  const [weather, setWeather] = useState<WeatherData>({ temp: 22, condition: '晴れ', description: '読み込み中...', precipitation: 0 })
  const [weatherLocation, setWeatherLocation] = useState('東京')
  const [showWeatherSettings, setShowWeatherSettings] = useState(false)
  const [tempWeatherLocation, setTempWeatherLocation] = useState('東京')
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)

  const [notes, setNotes] = useState<Note[]>([])
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null) // ドラッグ中のノートIDを追加

  const [showQuickPageForm, setShowQuickPageForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)

  const [isHydrated, setIsHydrated] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedQuickPages = localStorage.getItem('quickPages')
        const savedReminders = localStorage.getItem('reminders')
        const savedMailServices = localStorage.getItem('mailServices')
        const savedNotes = localStorage.getItem('notes')
        const savedWeatherLocation = localStorage.getItem('weatherLocation')
        const savedTheme = localStorage.getItem('theme')
        const savedIsStreaming = localStorage.getItem('isStreaming')
        const savedCategories = localStorage.getItem('categories')
        const savedActiveCategory = localStorage.getItem('activeCategory')

        if (savedQuickPages) setQuickPages(JSON.parse(savedQuickPages))
        if (savedReminders) setReminders(JSON.parse(savedReminders))
        if (savedMailServices) setMailServices(JSON.parse(savedMailServices))
        if (savedNotes) setNotes(JSON.parse(savedNotes))
        if (savedWeatherLocation) setWeatherLocation(savedWeatherLocation)
        if (savedTheme) setTheme(savedTheme as 'light' | 'dark')
        if (savedIsStreaming) setIsStreaming(JSON.parse(savedIsStreaming))
        if (savedCategories) setCategories(JSON.parse(savedCategories))
        if (savedActiveCategory) setActiveCategory(savedActiveCategory)
      } catch (error) {
        console.error('localStorageからの読み込みエラー:', error)
      }
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('quickPages', JSON.stringify(quickPages))
    }
  }, [quickPages, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('reminders', JSON.stringify(reminders))
    }
  }, [reminders, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('mailServices', JSON.stringify(mailServices))
    }
  }, [mailServices, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('notes', JSON.stringify(notes))
    }
  }, [notes, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('weatherLocation', weatherLocation)
    }
  }, [weatherLocation, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('theme', theme)
    }
  }, [theme, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('isStreaming', JSON.stringify(isStreaming))
    }
  }, [isStreaming, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('categories', JSON.stringify(categories))
    }
  }, [categories, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('activeCategory', activeCategory)
    }
  }, [activeCategory, isHydrated])


  const fetchWeather = async (location: string) => {
    setIsLoadingWeather(true)
    try {
      const weatherData = await fetchWeatherData(location)
      setWeather(weatherData)
    } catch (error) {
      console.error('天気情報の取得エラー:', error)
      setWeather({
        temp: 22,
        condition: 'エラー',
        description: '天気情報を取得できませんでした',
        precipitation: 0 // エラー時も precipitation を初期化
      })
    } finally {
      setIsLoadingWeather(false)
    }
  }

  useEffect(() => {
    fetchWeather(weatherLocation)
  }, [weatherLocation])

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const checkReminders = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      reminders.forEach(reminder => {
        if (
          reminder.time && 
          reminder.time === currentTime && 
          !reminder.completed && 
          !notifiedReminders.has(reminder.id)
        ) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('リマインダー', {
              body: reminder.text,
              icon: '/placeholder.svg?height=64&width=64',
            })
          }
          setNotifiedReminders(prev => new Set(prev).add(reminder.id))
        }
      })
    }

    const interval = setInterval(checkReminders, 30000) // 30秒ごとにチェック
    checkReminders() // 初回実行

    return () => clearInterval(interval)
  }, [reminders, notifiedReminders])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K または Cmd+K で検索を開く
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      // Escapeで検索を閉じる
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false)
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const addQuickPage = () => {
    if (newPageName && newPageUrl) {
      setQuickPages([...quickPages, { 
        id: Date.now().toString(), 
        name: newPageName, 
        url: newPageUrl,
        hideOnStream: newPageHideOnStream,
        categoryId: newPageCategoryId // カテゴリIDを設定
      }])
      setNewPageName('')
      setNewPageUrl('')
      setNewPageHideOnStream(false)
      setNewPageCategoryId('default')
      setShowQuickPageForm(false)
    }
  }

  const removeQuickPage = (id: string) => {
    setQuickPages(quickPages.filter(page => page.id !== id))
  }


  const addReminder = () => {
    if (newReminderText) {
      setReminders([...reminders, { 
        id: Date.now().toString(), 
        text: newReminderText, 
        completed: false,
        time: newReminderTime || undefined,
        hideOnStream: newReminderHideOnStream
      }])
      setNewReminderText('')
      setNewReminderTime('')
      setNewReminderHideOnStream(false)
      setShowReminderForm(false)
    }
  }

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
  }

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id))
    setNotifiedReminders(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
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

    setReminders(newReminders)
    setDraggedReminderId(null)
  }

  const toggleReminderHideOnStream = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, hideOnStream: !reminder.hideOnStream } : reminder
    ))
  }

  const addMailService = () => {
    if (newMailName && newMailUrl) {
      setMailServices([...mailServices, {
        id: Date.now().toString(),
        name: newMailName,
        url: newMailUrl
      }])
      setNewMailName('')
      setNewMailUrl('')
      setShowMailForm(false)
    }
  }

  const removeMailService = (id: string) => {
    setMailServices(mailServices.filter(mail => mail.id !== id))
  }

  const addCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: '新しいカテゴリ'
    }
    setCategories([...categories, newCategory])
    // 新しく追加したカテゴリをアクティブにする
    setActiveCategory(newCategory.id)
    setEditingCategoryId(newCategory.id)
    setEditingCategoryName(newCategory.name)
  }

  const removeCategory = (categoryId: string) => {
    if (categoryId === 'default') return
    // カテゴリに属するアイテムをdefaultカテゴリに移動
    setQuickPages(quickPages.map(page => 
      page.categoryId === categoryId ? { ...page, categoryId: 'default' } : page
    ))
    setCategories(categories.filter(cat => cat.id !== categoryId))
    if (activeCategory === categoryId) {
      setActiveCategory('default')
    }
  }

  const startEditingCategory = (categoryId: string, name: string) => {
    if (categoryId === 'default') return
    setEditingCategoryId(categoryId)
    setEditingCategoryName(name)
  }

  const saveCategory = () => {
    if (editingCategoryId && editingCategoryName.trim()) {
      setCategories(categories.map(cat => 
        cat.id === editingCategoryId ? { ...cat, name: editingCategoryName } : cat
      ))
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

      setCategories(prev => {
        const updated = [...prev]
        const draggedIndex = updated.findIndex(cat => cat.id === draggedCategoryId)
        const targetIndex = updated.findIndex(cat => cat.id === targetCategoryId)

        if (draggedIndex === -1 || targetIndex === -1) {
          return prev
        }

        const [moved] = updated.splice(draggedIndex, 1)
        updated.splice(targetIndex, 0, moved)
        return updated
      })

      setDraggedCategoryId(null)
      return
    }

    if (!draggedItemId) return

    setQuickPages(prev => 
      prev.map(page => 
        page.id === draggedItemId ? { ...page, categoryId: targetCategoryId } : page
      )
    )
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

    setQuickPages(newPages)
    setDraggedItemId(null)
  }

  const toggleHideOnStream = (id: string) => {
    setQuickPages(quickPages.map(page => 
      page.id === id ? { ...page, hideOnStream: !page.hideOnStream } : page
    ))
  }

  const filterBySearch = <T extends { name?: string; text?: string; title?: string; content?: string }>(
    items: T[]
  ): T[] => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => 
      (item.name?.toLowerCase().includes(query)) ||
      (item.text?.toLowerCase().includes(query)) ||
      (item.title?.toLowerCase().includes(query)) ||
      (item.content?.toLowerCase().includes(query))
    )
  }

  const quickPagesByMode = isStreaming
    ? quickPages.filter(page => !page.hideOnStream)
    : quickPages

  const quickPagesInActiveCategory = activeCategory === 'default'
    ? quickPagesByMode
    : quickPagesByMode.filter(page => page.categoryId === activeCategory)

  const filteredQuickPages = filterBySearch(quickPagesInActiveCategory)

  const filteredReminders = filterBySearch(
    isStreaming
      ? reminders.filter(reminder => !reminder.hideOnStream)
      : reminders
  )

  const filteredNotes = filterBySearch(notes)
  const filteredPinnedNotes = filteredNotes.filter(note => note.pinned)
  const filteredUnpinnedNotes = filteredNotes.filter(note => !note.pinned)

  const visibleReminders = isStreaming
    ? reminders.filter(reminder => !reminder.hideOnStream)
    : reminders

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

  const saveWeatherLocation = () => {
    setWeatherLocation(tempWeatherLocation)
    setShowWeatherSettings(false)
    fetchWeather(tempWeatherLocation)
  }

  const addNote = () => {
    if (newNoteTitle || newNoteContent) {
      const colors = ['#fef3c7', '#dbeafe', '#fce7f3', '#e0e7ff', '#dcfce7']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      setNotes([...notes, {
        id: Date.now().toString(),
        title: newNoteTitle,
        content: newNoteContent,
        color: randomColor,
        pinned: false // 初期状態はピン留めなし
      }])
      setNewNoteTitle('')
      setNewNoteContent('')
      setShowNoteForm(false)
    }
  }

  const removeNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id)
    setNewNoteTitle(note.title)
    setNewNoteContent(note.content)
    setShowNoteForm(true)
  }

  const updateNote = () => {
    if (editingNoteId && (newNoteTitle || newNoteContent)) {
      setNotes(notes.map(note => 
        note.id === editingNoteId 
          ? { ...note, title: newNoteTitle, content: newNoteContent }
          : note
      ))
      setNewNoteTitle('')
      setNewNoteContent('')
      setShowNoteForm(false)
      setEditingNoteId(null)
    }
  }

  const cancelNoteEdit = () => {
    setNewNoteTitle('')
    setNewNoteContent('')
    setShowNoteForm(false)
    setEditingNoteId(null)
  }

  const togglePinNote = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, pinned: !note.pinned } : note
    ))
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

    // ピン留め状態が異なる場合は並び替えしない
    if (draggedNote.pinned !== targetNote.pinned) return

    const draggedIndex = notes.findIndex(n => n.id === draggedNoteId)
    const targetIndex = notes.findIndex(n => n.id === targetId)

    const newNotes = [...notes]
    const [draggedItem] = newNotes.splice(draggedIndex, 1)
    newNotes.splice(targetIndex, 0, draggedItem)

    setNotes(newNotes)
    setDraggedNoteId(null)
  }

  const pinnedNotes = notes.filter(note => note.pinned)
  const unpinnedNotes = notes.filter(note => !note.pinned)

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300 relative">
      <div
        className="fixed inset-0 z-0"
        style={{
          background: theme === 'light'
            ? "radial-gradient(125% 125% at 50% 90%, #000000 40%, #0d1a36 100%)"
            : "radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)",
        }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-14 items-center px-4 gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-foreground"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-xl font-semibold text-balance">マイスタートページ</h1>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="text-foreground"
              title="検索 (Ctrl+K)"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant={isStreaming ? "default" : "outline"}
              size="sm"
              onClick={() => setIsStreaming(!isStreaming)}
              className={cn(
                "ml-4 gap-2",
                isStreaming && "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              <Radio className={cn("h-4 w-4", isStreaming && "animate-pulse")} />
              配信中
            </Button>
            {isStreaming && (
              <div className="text-xs font-medium text-red-600 dark:text-red-300 whitespace-nowrap">
                配信中モード: 非表示設定のページは表示されません
              </div>
            )}
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-foreground"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showSearch && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border overflow-hidden"
              >
                <div className="p-4">
                  <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Quick Pages、Reminder、Noteを検索... (Escで閉じる)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                      autoFocus
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={cn(
              'fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out z-40',
              !sidebarOpen && '-translate-x-full'
            )}
          >
            <nav className="p-4 space-y-2">
              <motion.div whileHover={{ scale: 1.02, x: 4 }} transition={{ duration: 0.2 }}>
                <Button
                  variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('dashboard')}
                >
                  Dashboard
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, x: 4 }} transition={{ duration: 0.2 }}>
                <Button
                  variant={activeView === 'quick-pages' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('quick-pages')}
                >
                  Quick Pages
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, x: 4 }} transition={{ duration: 0.2 }}>
                <Button
                  variant={activeView === 'reminder' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('reminder')}
                >
                  Reminder
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, x: 4 }} transition={{ duration: 0.2 }}>
                <Button
                  variant={activeView === 'mail' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('mail')}
                >
                  Mail
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, x: 4 }} transition={{ duration: 0.2 }}>
                <Button
                  variant={activeView === 'note' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('note')}
                >
                  Note
                </Button>
              </motion.div>
            </nav>
          </aside>

          {/* Main Content */}
          <main
            className={cn(
              'flex-1 transition-all duration-300 ease-in-out',
              sidebarOpen ? 'ml-64' : 'ml-0'
            )}
          >
            <div className="container mx-auto p-6 max-w-7xl">
              {/* Weather Widget - Fixed Position */}
              {!isStreaming && (
                <div className="fixed right-6 top-20 z-30">
                  <Card className="p-4 w-48 bg-card/95 backdrop-blur relative group">
                    {isLoadingWeather ? (
                      <div className="flex items-center justify-center h-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Cloud className="h-8 w-8 text-primary" />
                          <div>
                            <div className="text-2xl font-bold">{weather.temp}°C</div>
                            <div className="text-sm text-muted-foreground">{weather.condition}</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">💧</span>
                          <span className="text-muted-foreground">{weather.precipitation}%</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{weatherLocation}</div>
                      </>
                    )}
                    
                    {/* 設定ボタン */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setTempWeatherLocation(weatherLocation)
                        setShowWeatherSettings(!showWeatherSettings)
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>

                    {/* 設定パネル */}
                    {showWeatherSettings && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-4 z-50">
                        <h3 className="text-sm font-semibold mb-3">地域設定</h3>
                        <div className="flex flex-col gap-3">
                          <Input
                            placeholder="地域名を入力 (例: 東京, Tokyo, Osaka)"
                            value={tempWeatherLocation}
                            onChange={(e) => setTempWeatherLocation(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveWeatherLocation()}
                          />
                          <div className="text-xs text-muted-foreground">
                            ※ 日本語または英語で都市名を入力してください
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={saveWeatherLocation} size="sm" className="flex-1">
                              保存
                            </Button>
                            <Button 
                              onClick={() => setShowWeatherSettings(false)} 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                            >
                              キャンセル
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Dashboard View */}
              {activeView === 'dashboard' && (
                <div className="space-y-6 mr-56">
                  <h2 className="text-3xl font-bold text-balance">ダッシュボード</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Quick Pages</h3>
                      <p className="text-sm text-muted-foreground">
                        {quickPages.length} 個のページを登録済み
                      </p>
                    </Card>
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Mail</h3>
                      <p className="text-sm text-muted-foreground">
                        {mailServices.length} 個のメールサービス
                      </p>
                    </Card>
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Reminders</h3>
                      <p className="text-sm text-muted-foreground">
                        {reminders.filter(r => !r.completed).length} 個の未完了タスク
                      </p>
                    </Card>
                  </div>
                  
                  {visibleReminders.length === 0 ? (
                    <Card className="p-12 text-center">
                      <div className="text-muted-foreground mb-4">
                        まだリマインダーが登録されていません
                      </div>
                      <Button onClick={() => setActiveView('reminder')}>
                        リマインダーを追加
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {visibleReminders.filter(r => !r.completed).length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-3">未完了のタスク</h3>
                          <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                              {visibleReminders
                                .filter(r => !r.completed)
                                .map((reminder) => (
                                  <motion.div
                                    key={reminder.id}
                                    layout
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Card className="p-4 hover:shadow-lg transition-shadow">
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={reminder.completed}
                                          onChange={() => toggleReminder(reminder.id)}
                                          className="h-5 w-5 rounded border-border cursor-pointer"
                                        />
                                        <div className="flex-1">
                                          <span className="block">{reminder.text}</span>
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
                                      </div>
                                    </Card>
                                  </motion.div>
                                ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {visibleReminders.filter(r => r.completed).length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-muted-foreground">
                            完了したタスク
                          </h3>
                          <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                              {visibleReminders
                                .filter(r => r.completed)
                                .map((reminder) => (
                                  <motion.div
                                    key={reminder.id}
                                    layout
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Card className="p-4 bg-muted/50">
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={reminder.completed}
                                          onChange={() => toggleReminder(reminder.id)}
                                          className="h-5 w-5 rounded border-border cursor-pointer"
                                        />
                                        <div className="flex-1">
                                          <span className="block line-through text-muted-foreground">
                                            {reminder.text}
                                          </span>
                                          {reminder.time && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                              <Bell className="h-3 w-3" />
                                              {reminder.time}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </Card>
                                  </motion.div>
                                ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Pages View */}
              {activeView === 'quick-pages' && (
                <div className="space-y-6 mr-56">
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
                        <Button onClick={addQuickPage} className="sm:w-auto">
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
                            onClick={() => setActiveCategory(category.id)}
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
                                    removeCategory(category.id)
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
                          onClick={addCategory}
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
                                    toggleHideOnStream(page.id)
                                  }}
                                  title={page.hideOnStream ? "配信中に表示する" : "配信中に非表示にする"}
                                >
                                  <Radio className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeQuickPage(page.id)}
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
              )}


              {/* Reminder View */}
              {activeView === 'reminder' && (
                <div className="space-y-6 mr-56">
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
                          onKeyPress={(e) => e.key === 'Enter' && addReminder()}
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
                        <Button onClick={addReminder}>
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
                                  onChange={() => toggleReminder(reminder.id)}
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
                                    onClick={() => toggleReminderHideOnStream(reminder.id)}
                                    title={reminder.hideOnStream ? "配信中に表示する" : "配信中に非表示にする"}
                                  >
                                    <Radio className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeReminder(reminder.id)}
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
              )}

              {/* Mail View */}
              {activeView === 'mail' && (
                <div className="space-y-6 mr-56">
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
                        <Button onClick={addMailService} className="sm:w-auto">
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
                                onClick={() => removeMailService(mail.id)}
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
              )}

              {activeView === 'note' && (
                <div className="space-y-6 mr-56">
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
                        <div className="flex gap-2">
                          <Button onClick={editingNoteId ? updateNote : addNote} className="flex-1">
                            {editingNoteId ? '更新' : '追加'}
                          </Button>
                          <Button onClick={cancelNoteEdit} variant="outline" className="flex-1">
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
                                        draggedNoteId === note.id && "opacity-50 scale-95 ring-2 ring-primary"
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
                                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={cn("h-6 w-6", note.pinned && "opacity-100")}
                                          style={{ color: textColor }}
                                          onClick={() => togglePinNote(note.id)}
                                          title={note.pinned ? "ピン留めを解除" : "ピン留めする"}
                                        >
                                          <Pin className={cn("h-3 w-3", note.pinned && "fill-current")} />
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
                                          onClick={() => removeNote(note.id)}
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
                                        draggedNoteId === note.id && "opacity-50 scale-95 ring-2 ring-primary"
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
                                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={cn("h-6 w-6", note.pinned && "opacity-100")}
                                          style={{ color: textColor }}
                                          onClick={() => togglePinNote(note.id)}
                                          title={note.pinned ? "ピン留めを解除" : "ピン留めする"}
                                        >
                                          <Pin className={cn("h-3 w-3", note.pinned && "fill-current")} />
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
                                          onClick={() => removeNote(note.id)}
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
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
