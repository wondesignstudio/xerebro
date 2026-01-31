'use client'

import { useEffect, useState } from 'react'

type LoginToastProps = {
  message: string
  isVisible: boolean
}

export default function LoginToast({ message, isVisible }: LoginToastProps) {
  // Toast should auto-dismiss after 3 seconds.
  const [visible, setVisible] = useState(isVisible)

  useEffect(() => {
    if (!isVisible) {
      return
    }

    const timeoutId = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timeoutId)
  }, [isVisible])

  if (!visible) {
    return null
  }

  return (
    <div className="fixed right-6 top-6 z-50 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
      {message}
    </div>
  )
}
