'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-4 lg:px-6 transition-colors">
      <div className="flex-1 flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search patients, appointments..."
            className="pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative dark:text-gray-300">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
            3
          </span>
        </Button>
      </div>
    </header>
  )
}
