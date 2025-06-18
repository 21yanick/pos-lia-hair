'use client'

import { cn } from '@/shared/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'

interface ProfileAvatarProps {
  name?: string
  email?: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showOnlineStatus?: boolean
}

// Generate initials from name or email
function getInitials(name?: string, email?: string): string {
  if (name) {
    const words = name.trim().split(' ')
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  
  return 'U'
}

// Generate consistent color based on user data
function getAvatarColor(name?: string, email?: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ]
  
  const str = name || email || 'default'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm', 
  lg: 'h-10 w-10 text-base'
}

export function ProfileAvatar({ 
  name, 
  email, 
  avatarUrl, 
  size = 'md',
  className,
  showOnlineStatus = false
}: ProfileAvatarProps) {
  const initials = getInitials(name, email)
  const avatarColor = getAvatarColor(name, email)
  
  return (
    <div className={cn('relative', className)}>
      <Avatar className={cn(sizeClasses[size], className)}>
        {avatarUrl && (
          <AvatarImage 
            src={avatarUrl} 
            alt={name || email || 'User Avatar'} 
          />
        )}
        <AvatarFallback 
          className={cn(
            avatarColor, 
            'text-white font-medium',
            'select-none transition-colors'
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineStatus && (
        <div className={cn(
          'absolute bottom-0 right-0 block rounded-full bg-green-400 ring-2 ring-background',
          size === 'sm' && 'h-1.5 w-1.5',
          size === 'md' && 'h-2 w-2', 
          size === 'lg' && 'h-2.5 w-2.5'
        )} />
      )}
    </div>
  )
}