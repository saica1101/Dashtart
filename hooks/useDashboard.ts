import { useState, useEffect } from 'react'

export type QuickPage = {
  id: string
  name: string
  url: string
  hideOnStream: boolean
  categoryId: string
}

export type Category = {
  id: string
  name: string
}

export type Reminder = {
  id: string
  text: string
  completed: boolean
  time?: string
  hideOnStream: boolean
}

export type MailService = {
  id: string
  name: string
  url: string
}

export type Note = {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
  hideOnStream: boolean
}

export function useDashboard() {
  const [isHydrated, setIsHydrated] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  
  // Categories
  const [categories, setCategories] = useState<Category[]>([
    { id: 'default', name: 'すべて' }
  ])
  const [activeCategory, setActiveCategory] = useState('default')

  // Quick Pages
  const [quickPages, setQuickPages] = useState<QuickPage[]>([
    { id: '1', name: 'Google', url: 'https://www.google.com', hideOnStream: false, categoryId: 'default' },
    { id: '2', name: 'GitHub', url: 'https://github.com', hideOnStream: false, categoryId: 'default' },
    { id: '3', name: 'YouTube', url: 'https://www.youtube.com', hideOnStream: false, categoryId: 'default' },
  ])

  // Reminders
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', text: '会議に参加する', completed: false, time: '14:00', hideOnStream: false },
    { id: '2', text: 'プロジェクト資料を準備', completed: false, hideOnStream: false },
  ])
  const [notifiedReminders, setNotifiedReminders] = useState<Set<string>>(new Set())

  // Mail Services
  const [mailServices, setMailServices] = useState<MailService[]>([
    { id: '1', name: 'Gmail', url: 'https://mail.google.com' },
  ])

  // Notes
  const [notes, setNotes] = useState<Note[]>([])

  // Persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedQuickPages = localStorage.getItem('quickPages')
        const savedReminders = localStorage.getItem('reminders')
        const savedMailServices = localStorage.getItem('mailServices')
        const savedNotes = localStorage.getItem('notes')
        const savedTheme = localStorage.getItem('theme')
        const savedIsStreaming = localStorage.getItem('isStreaming')
        const savedCategories = localStorage.getItem('categories')
        const savedActiveCategory = localStorage.getItem('activeCategory')

        if (savedQuickPages) setQuickPages(JSON.parse(savedQuickPages))
        if (savedReminders) setReminders(JSON.parse(savedReminders))
        if (savedMailServices) setMailServices(JSON.parse(savedMailServices))
        if (savedNotes) setNotes(JSON.parse(savedNotes))
        if (savedTheme) setTheme(savedTheme as 'light' | 'dark')
        if (savedIsStreaming) setIsStreaming(JSON.parse(savedIsStreaming))
        if (savedCategories) setCategories(JSON.parse(savedCategories))
        if (savedActiveCategory) setActiveCategory(savedActiveCategory)
      } catch (error) {
        console.error('localStorage load error:', error)
      }
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem('quickPages', JSON.stringify(quickPages))
    localStorage.setItem('reminders', JSON.stringify(reminders))
    localStorage.setItem('mailServices', JSON.stringify(mailServices))
    localStorage.setItem('notes', JSON.stringify(notes))
    localStorage.setItem('theme', theme)
    localStorage.setItem('isStreaming', JSON.stringify(isStreaming))
    localStorage.setItem('categories', JSON.stringify(categories))
    localStorage.setItem('activeCategory', activeCategory)
  }, [quickPages, reminders, mailServices, notes, theme, isStreaming, categories, activeCategory, isHydrated])

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Reminder Notifications
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

    const interval = setInterval(checkReminders, 30000)
    checkReminders()
    return () => clearInterval(interval)
  }, [reminders, notifiedReminders])

  // Actions
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
  
  // Quick Pages Actions
  const addQuickPage = (name: string, url: string, hideOnStream: boolean, categoryId: string) => {
    setQuickPages([...quickPages, { 
      id: Date.now().toString(), 
      name, url, hideOnStream, categoryId 
    }])
  }
  const removeQuickPage = (id: string) => setQuickPages(quickPages.filter(p => p.id !== id))
  const toggleQuickPageHide = (id: string) => {
    setQuickPages(quickPages.map(p => p.id === id ? { ...p, hideOnStream: !p.hideOnStream } : p))
  }
  const updateQuickPages = (newPages: QuickPage[]) => setQuickPages(newPages)

  // Category Actions
  const addCategory = () => {
    const newCategory = { id: Date.now().toString(), name: '新しいカテゴリ' }
    setCategories([...categories, newCategory])
    setActiveCategory(newCategory.id)
    return newCategory
  }
  const removeCategory = (id: string) => {
    if (id === 'default') return
    setQuickPages(quickPages.map(p => p.categoryId === id ? { ...p, categoryId: 'default' } : p))
    setCategories(categories.filter(c => c.id !== id))
    if (activeCategory === id) setActiveCategory('default')
  }
  const updateCategory = (id: string, name: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name } : c))
  }
  const updateCategories = (newCategories: Category[]) => setCategories(newCategories)

  // Reminder Actions
  const addReminder = (text: string, time: string, hideOnStream: boolean) => {
    setReminders([...reminders, {
      id: Date.now().toString(), text, completed: false, time: time || undefined, hideOnStream
    }])
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
  const toggleReminderHide = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, hideOnStream: !r.hideOnStream } : r))
  }
  const updateReminders = (newReminders: Reminder[]) => setReminders(newReminders)

  // Mail Actions
  const addMailService = (name: string, url: string) => {
    setMailServices([...mailServices, { id: Date.now().toString(), name, url }])
  }
  const removeMailService = (id: string) => setMailServices(mailServices.filter(m => m.id !== id))

  // Note Actions
  const addNote = (title: string, content: string, hideOnStream: boolean) => {
    const colors = ['#fef3c7', '#dbeafe', '#fce7f3', '#e0e7ff', '#dcfce7']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setNotes([...notes, {
      id: Date.now().toString(), title, content, color: randomColor, pinned: false, hideOnStream
    }])
  }
  const removeNote = (id: string) => setNotes(notes.filter(n => n.id !== id))
  const updateNote = (id: string, title: string, content: string, hideOnStream: boolean) => {
    setNotes(notes.map(n => n.id === id ? { ...n, title, content, hideOnStream } : n))
  }
  const togglePinNote = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }
  const toggleNoteHide = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, hideOnStream: !n.hideOnStream } : n))
  }
  const updateNotes = (newNotes: Note[]) => setNotes(newNotes)

  return {
    isHydrated,
    isStreaming, setIsStreaming,
    theme, toggleTheme,
    categories, activeCategory, setActiveCategory,
    quickPages,
    reminders,
    mailServices,
    notes,
    actions: {
      setActiveCategory,
      addQuickPage, removeQuickPage, toggleQuickPageHide, updateQuickPages,
      addCategory, removeCategory, updateCategory, updateCategories,
      addReminder, toggleReminder, removeReminder, toggleReminderHide, updateReminders,
      addMailService, removeMailService,
      addNote, removeNote, updateNote, togglePinNote, toggleNoteHide, updateNotes
    }
  }
}
