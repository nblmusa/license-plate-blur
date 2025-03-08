"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { SplitIcon } from "lucide-react"

interface ImageComparisonProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function ImageComparison({
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "Protected",
  className
}: ImageComparisonProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [splitPosition, setSplitPosition] = useState(70)
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sliderRef.current || !containerRef.current) return

      const step = e.shiftKey ? 10 : 2
      let newPosition = splitPosition

      switch (e.key) {
        case 'ArrowLeft':
          newPosition = Math.max(0, splitPosition - step)
          break
        case 'ArrowRight':
          newPosition = Math.min(100, splitPosition + step)
          break
        default:
          return
      }

      setSplitPosition(newPosition)
      e.preventDefault()
    }

    if (sliderRef.current) {
      sliderRef.current.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (sliderRef.current) {
        sliderRef.current.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [splitPosition])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const percentage = (x / rect.width) * 100
      setSplitPosition(percentage)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
    }

    if (isResizing) {
      document.body.style.cursor = 'ew-resize'
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Touch events handling
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing || !containerRef.current) return
      e.preventDefault()

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width))
      const percentage = (x / rect.width) * 100
      setSplitPosition(percentage)
    }

    const handleTouchEnd = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isResizing])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group",
        className
      )}
      onMouseDown={() => setIsResizing(true)}
      onTouchStart={() => setIsResizing(true)}
      role="region"
      aria-label="Image comparison slider"
    >
      {/* Before Image */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage}
          alt={`Before - ${beforeLabel}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
          <p className="absolute bottom-4 left-4 text-white font-medium text-sm sm:text-base">
            {beforeLabel}
          </p>
        </div>
      </div>

      {/* After Image */}
      <div 
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}
      >
        <Image
          src={afterImage}
          alt={`After - ${afterLabel}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
          <p className="absolute bottom-4 left-4 text-white font-medium text-sm sm:text-base">
            {afterLabel}
          </p>
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        ref={sliderRef}
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize group-hover:bg-blue-500 transition-colors duration-200"
        style={{ left: `${splitPosition}%` }}
        role="slider"
        aria-label="Image comparison slider"
        aria-valuenow={Math.round(splitPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-200">
          <SplitIcon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors duration-200" />
        </div>
        {/* Add keyboard instructions tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Use arrow keys to adjust
          </div>
        </div>
      </div>

      {/* Add initial instruction overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-black/75 text-white text-sm px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          Drag slider or use arrow keys to compare
        </div>
      </div>
    </div>
  )
} 