'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
  }

  const toolbarButtons = [
    { label: 'Bold', action: () => insertMarkdown('**', '**'), icon: 'B' },
    { label: 'Italic', action: () => insertMarkdown('*', '*'), icon: 'I' },
    { label: 'Code', action: () => insertMarkdown('`', '`'), icon: '</>' },
    { label: 'Heading 1', action: () => insertMarkdown('# '), icon: 'H1' },
    { label: 'Heading 2', action: () => insertMarkdown('## '), icon: 'H2' },
    { label: 'Heading 3', action: () => insertMarkdown('### '), icon: 'H3' },
    { label: 'List', action: () => insertMarkdown('- '), icon: '•' },
  ]

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button) => (
            <Button
              key={button.label}
              type="button"
              variant="ghost"
              size="sm"
              onClick={button.action}
              className="px-2 py-1 text-xs font-mono"
              title={button.label}
            >
              {button.icon}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant={!isPreview ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setIsPreview(false)}
            className="text-xs"
          >
            Edit
          </Button>
          <Button
            type="button"
            variant={isPreview ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setIsPreview(true)}
            className="text-xs"
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {!isPreview ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-64 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
          />
        ) : (
          <div className="h-64 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-y-auto">
            {value ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: `<p class="mb-4">${formatMarkdown(value)}</p>`
                }}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                {placeholder || 'Nothing to preview...'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supports Markdown: **bold**, *italic*, `code`, # headings, - lists
        </p>
      </div>
    </div>
  )
}