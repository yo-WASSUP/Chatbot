import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to AI Chat</h1>
      <Link href="/chat" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Start Chatting
      </Link>
    </main>
  )
}
