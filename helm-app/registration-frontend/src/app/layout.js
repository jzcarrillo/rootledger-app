// ✅ src/app/layout.js

import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '@/theme/theme'; // <-- import your theme from separate file

// Fonts
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// ✅ Metadata (allowed here because this is a Server Component)
export const metadata = {
  title: 'Land Registration System',
  description: 'POC',
};

// ✅ Layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
