'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Moon, Sun, Menu, X, Search, LayoutDashboard, Link, Bell, Mail, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

import { useDashboard } from '@/hooks/useDashboard'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import { QuickLinks } from '@/components/dashboard/QuickLinks'
import { ReminderList } from '@/components/dashboard/ReminderList'
import { MailWidget } from '@/components/dashboard/MailWidget'
import { NoteWidget } from '@/components/dashboard/NoteWidget'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<'dashboard' | 'quick-pages' | 'reminder' | 'mail' | 'note'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const {
    isHydrated,
    isStreaming, setIsStreaming,
    theme, toggleTheme,
    categories, activeCategory, setActiveCategory,
    quickPages,
    reminders,
    mailServices,
    notes,
    actions
  } = useDashboard()

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false)
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch])

  // Keyboard shortcut for streaming mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '.') {
        e.preventDefault()
        setIsStreaming(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsStreaming])

  if (!isHydrated) {
    return null // or a loading spinner
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quick-pages', label: 'Quick Pages', icon: Link },
    { id: 'reminder', label: 'Reminder', icon: Bell },
    { id: 'mail', label: 'Mail', icon: Mail },
    { id: 'note', label: 'Note', icon: StickyNote },
  ]

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden font-sans selection:bg-primary/20"
    )}>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {theme === 'light' ? (
          <div
            className="absolute inset-0 z-0"
            style={{
              background: "#ffffff",
              backgroundImage: `
                radial-gradient(circle at top center, rgba(59, 130, 246, 0.5),transparent 70%)
              `,
            }}
          />
        ) : (
          <div
            className="absolute inset-0 z-0 bg-black"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
                radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
                radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
              `,
            }}
          />
        )}
      </div>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: sidebarOpen ? 0 : -280 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-64 bg-card/80 backdrop-blur-xl border-r border-border z-40 flex flex-col shadow-2xl"
          >
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Dashtart
              </h1>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-base font-medium relative overflow-hidden transition-all duration-200",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setActiveView(item.id as any)}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 bg-primary/10 border-r-2 border-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("h-5 w-5 relative z-10", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="relative z-10">{item.label}</span>
                  </Button>
                )
              })}
            </nav>

            <div className="p-4 border-t border-border space-y-4 bg-card/50">
              <div className="flex items-center justify-between px-2">
                <Button
                  variant={isStreaming ? "destructive" : "outline"}
                  className={cn(
                    "w-full justify-center gap-2 transition-all duration-500",
                    isStreaming && "animate-pulse bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  )}
                  onClick={() => setIsStreaming(!isStreaming)}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full bg-current",
                    isStreaming ? "animate-ping" : "bg-muted-foreground"
                  )} />
                  {isStreaming ? '配信中' : '配信中'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm font-medium text-muted-foreground">テーマ</span>
                <div className="flex items-center space-x-2">
                  <Sun className={cn("h-4 w-4 transition-colors", theme === 'light' ? "text-primary" : "text-muted-foreground")} />
                  <Switch
                    id="theme-mode"
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                  <Moon className={cn("h-4 w-4 transition-colors", theme === 'dark' ? "text-primary" : "text-muted-foreground")} />
                </div>
              </div>
            </div>
          </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className={cn(
          "relative min-h-screen transition-all duration-300",
          sidebarOpen ? "pl-64" : "pl-0"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div className="relative w-96 hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input 
                  placeholder="検索... (Cmd+K)" 
                  className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Weather Widget is now positioned absolutely or fixed, but here we might want a header summary? 
                   Actually the original design had the weather widget fixed. 
                   Let's keep the fixed weather widget outside the header or include it here if we want.
                   The original code had it fixed. Let's use the WeatherWidget component which has fixed positioning inside it?
                   Wait, let's check WeatherWidget.tsx again.
               */}
            </div>
        </header>


        {/* Search Overlay for Mobile/Shortcut */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-background/80 backdrop-blur-sm p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowSearch(false)
              }}
            >
              <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center px-4 border-b border-border">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="検索..."
                    className="flex-1 border-none shadow-none focus-visible:ring-0 h-14 text-lg bg-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="flex gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      ESC
                    </kbd>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32 lg:pr-64">
          <WeatherWidget isStreaming={isStreaming} />

          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <section>
                  <QuickLinks 
                    isStreaming={isStreaming}
                    searchQuery={searchQuery}
                    categories={categories}
                    activeCategory={activeCategory}
                    quickPages={quickPages}
                    actions={actions}
                  />
                </section>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section>
                    <ReminderList 
                      isStreaming={isStreaming}
                      searchQuery={searchQuery}
                      reminders={reminders}
                      actions={actions}
                    />
                  </section>
                  <section>
                    <MailWidget 
                      mailServices={mailServices}
                      actions={actions}
                    />
                  </section>
                </div>

                <section>
                  <NoteWidget 
                    theme={theme}
                    searchQuery={searchQuery}
                    notes={notes}
                    actions={actions}
                  />
                </section>
              </motion.div>
            )}

            {activeView === 'quick-pages' && (
              <motion.div
                key="quick-pages"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <QuickLinks 
                  isStreaming={isStreaming}
                  searchQuery={searchQuery}
                  categories={categories}
                  activeCategory={activeCategory}
                  quickPages={quickPages}
                  actions={actions}
                />
              </motion.div>
            )}

            {activeView === 'reminder' && (
              <motion.div
                key="reminder"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ReminderList 
                  isStreaming={isStreaming}
                  searchQuery={searchQuery}
                  reminders={reminders}
                  actions={actions}
                />
              </motion.div>
            )}

            {activeView === 'mail' && (
              <motion.div
                key="mail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MailWidget 
                  mailServices={mailServices}
                  actions={actions}
                />
              </motion.div>
            )}

            {activeView === 'note' && (
              <motion.div
                key="note"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <NoteWidget 
                  theme={theme}
                  searchQuery={searchQuery}
                  notes={notes}
                  actions={actions}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
