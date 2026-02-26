'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TooltipContent } from '@/lib/tooltipContent'

interface TooltipProps {
  content: TooltipContent
  /** Size of the trigger icon button */
  size?: 'xs' | 'sm' | 'md'
}

export default function Tooltip({ content, size = 'sm' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on click-outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }, [])

  // Icon size classes
  const iconSize = {
    xs: 'w-3 h-3 text-[9px]',
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
  }[size]

  return (
    <div ref={wrapperRef} className="relative inline-flex items-center" onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        type="button"
        aria-label={`Info: ${content.title}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`
          ${iconSize}
          inline-flex items-center justify-center rounded-full shrink-0
          bg-gray-200 dark:bg-gray-700
          text-gray-500 dark:text-gray-400
          hover:bg-blue-100 dark:hover:bg-blue-900/40
          hover:text-blue-600 dark:hover:text-blue-400
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
          transition-colors duration-150
          font-bold leading-none select-none
        `}
      >
        ?
      </button>

      {/* Floating panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="
              absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2
              w-72 max-w-[90vw]
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              rounded-xl shadow-xl dark:shadow-gray-950/60
              p-4
              text-left
            "
          >
            {/* Small arrow */}
            <div
              className="
                absolute -bottom-[7px] left-1/2 -translate-x-1/2
                w-3 h-3 rotate-45
                bg-white dark:bg-gray-900
                border-b border-r border-gray-200 dark:border-gray-700
              "
            />

            {/* Title */}
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {content.title}
            </p>

            {/* Description */}
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {content.description}
            </p>

            {/* Calculation note */}
            {content.calculation && (
              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                  <span className="font-semibold text-gray-500 dark:text-gray-400">How it&apos;s calculated: </span>
                  {content.calculation}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
