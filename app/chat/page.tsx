'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ComponentPropsWithoutRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase/config'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

type CodeProps = ComponentPropsWithoutRef<'code'> & { inline?: boolean }

export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      loadChatHistory();
    }
  }, [user, loading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const loadChatHistory = async () => {
    if (user) {
      const q = query(collection(db, `users/${user.uid}/messages`), orderBy('timestamp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => doc.data()).reverse();
      setChatHistory(history);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setChatHistory(prev => [...prev, userMessage]);
    setInput('');

    await addDoc(collection(db, `users/${user.uid}/messages`), {
      ...userMessage,
      timestamp: serverTimestamp()
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = response.body;
      if (!data) {
        throw new Error('No data in the response');
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let aiMessageContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        aiMessageContent += chunkValue;
        
        // 更新聊天历史以显示流式响应
        setChatHistory(prev => {
          const newHistory = [...prev];
          if (newHistory[newHistory.length - 1].role === 'assistant') {
            newHistory[newHistory.length - 1].content = aiMessageContent;
          } else {
            newHistory.push({ role: 'assistant', content: aiMessageContent });
          }
          return newHistory;
        });
      }

      // 将完整的 AI 响应保存到 Firestore
      await addDoc(collection(db, `users/${user.uid}/messages`), {
        role: 'assistant',
        content: aiMessageContent,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to get response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const handleSignOut = () => {
    auth.signOut();
    router.push('/');
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex flex-col items-center">
      <header className="w-full bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">GoodJuice Chat</h1>
        <button onClick={handleSignOut} className="text-red-500 hover:text-red-700">
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Sign Out
        </button>
      </header>
      <div className="w-full max-w-4xl flex-grow flex flex-col bg-white rounded-lg shadow-lg my-8 overflow-hidden">
        <div className="flex-grow overflow-auto p-4 space-y-4">
          {chatHistory.map((m, index) => (
            <div key={index} className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                    code: ({ inline, className, children, ...props }: CodeProps) => {
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
        <form onSubmit={handleSubmit} className="bg-white p-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <input
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              placeholder="Type a message..."
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}