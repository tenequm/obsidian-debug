'use client'

import { isDevelopmentMode, DEV_MODE_BANNER_TEXT } from '@/lib/development-mode'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Construction } from 'lucide-react'

export function DevelopmentBanner() {
  if (!isDevelopmentMode()) return null

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 dark:bg-yellow-950/20">
      <Construction className="h-4 w-4" />
      <AlertDescription className="text-sm font-medium">{DEV_MODE_BANNER_TEXT}</AlertDescription>
    </Alert>
  )
}
