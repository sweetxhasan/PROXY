import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proxy Downloader | Unlimited File Download Proxy',
  description: 'Powerful proxy server for downloading files, videos, audio without restrictions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <div className="min-h-screen bg-white dark:bg-black">
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
            <div className="max-w-6xl mx-auto px-4">
              <p>Proxy Downloader - Unlimited File Proxy Server</p>
              <p className="mt-2">No CORS | No Restrictions | Public Access</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
