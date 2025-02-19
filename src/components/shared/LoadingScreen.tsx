import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
}

export function LoadingScreen({ 
  message = 'Loading...', 
  fullScreen = false,
  size = 'md'
}: LoadingScreenProps) {
  const containerClasses = fullScreen 
    ? 'min-h-screen'
    : 'min-h-[50vh]'

  return (
    <div className={`flex items-center justify-center ${containerClasses}`}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <span className="text-muted-foreground font-medium">
          {message}
        </span>
      </div>
    </div>
  )
} 