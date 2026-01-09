'use client'

import { LogOut, FileText, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  user?: {
    username: string
    lastLogin?: string
  }
  onLogout: () => void
}

export function AdminHeader({ user, onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                PDF Embedder Admin
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Manage your PDF documents
              </p>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* Welcome message - hidden on mobile */}
            {user && (
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  Welcome back, {user.username}
                </p>
                {user.lastLogin && (
                  <p className="text-xs text-gray-500">
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* User dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-10 w-10 rounded-full"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.username || 'User'}
                    </p>
                    {user?.lastLogin && (
                      <p className="text-xs leading-none text-muted-foreground">
                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-700"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}