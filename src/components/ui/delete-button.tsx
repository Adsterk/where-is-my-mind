import { Trash2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface DeleteButtonProps {
  onDelete: () => void
  className?: string
}

export function DeleteButton({ onDelete, className }: DeleteButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onDelete}
      className={cn(
        "h-6 w-6 absolute top-2 right-2 text-destructive hover:text-destructive",
        className
      )}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
} 