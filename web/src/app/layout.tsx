import type {Metadata} from 'next'
import {Hanken_Grotesk, Jost, Newsreader} from 'next/font/google'
import './globals.css'

const jost = Jost({variable: '--font-jost', subsets: ['latin'], weight: ['400', '500', '600']})
const hanken = Hanken_Grotesk({variable: '--font-hanken', subsets: ['latin']})
const newsreader = Newsreader({variable: '--font-newsreader', subsets: ['latin'], style: ['normal', 'italic']})

export const metadata: Metadata = {
  title: 'Will It Focus',
  description:
    "Ask whether a camera body, lens and adapter will autofocus together, and why focus still misses. Every quote is checked against the manufacturer's own document.",
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" data-theme="dark" className={`${jost.variable} ${hanken.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  )
}
