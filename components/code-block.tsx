"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Check, Copy } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import '../styles/prism-custom.css'

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Prism.highlightAll()
  }, [code])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative bg-gray-100 rounded-md">
      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto border border-gray-300">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4"
        onClick={copyToClipboard}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2 text-green-500" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </>
        )}
      </Button>
    </div>
  )
}

