import './globals.css';
import { Inter, Playfair_Display, Sacramento } from 'next/font/google';
import ClientWrapper from '../components/ClientWrapper';

// Configure Google Fonts for premium typography
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const sacramento = Sacramento({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-sacramento',
  display: 'swap',
});

export const metadata = {
  title: 'Happy Birthday, My Love | A Digital Love Scrapbook',
  description: 'Celebrating the most beautiful chapter of my life. A collection of memories, letters, voice notes, and milestone stories.',
  keywords: 'birthday surprise, romantic gift, love scrapbook, memory museum, couples timeline',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${sacramento.variable}`}>
      <body className="antialiased min-h-screen bg-[#fffcf5] overflow-x-hidden">
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
