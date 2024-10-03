'use client'

import { useChat } from 'ai/react'
import { useRef, useEffect } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'

// 修改 CodeProps 类型定义
type CodeProps = Components['code']

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-[600px] overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className="flex-shrink-0">
                  <Image src="/ai-avatar.png" alt="AI" width={40} height={40} className="rounded-full" />
                </div>
              )}
              <div className={`max-w-[70%] px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="markdown-body"
                  components={{
                    pre: ({ children }) => (
                      <div className="overflow-auto w-full my-2">
                        <pre>{children}</pre>
                      </div>
                    ),
                    code: ({ inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline ? (
                        <pre className={match ? `language-${match[1]}` : ''}>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className={`${className} inline-code`} {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
              {m.role === 'user' && (
                <div className="flex-shrink-0">
                  <Image src="/user-avatar.png" alt="User" width={40} height={40} className="rounded-full" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <input
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 chat-input"
              value={input}
              placeholder="Type a message..."
              onChange={handleInputChange}
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
