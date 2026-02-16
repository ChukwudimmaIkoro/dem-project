import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dem - Your 3-Day Health Journey',
  description: 'Diet, Exercise, Mentality - build healthy habits that stick',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress browser extension errors
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason?.message?.includes('message channel closed')) {
                  event.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
      <body className="max-w-md mx-auto">
        {children}
      </body>
    </html>
  )
}