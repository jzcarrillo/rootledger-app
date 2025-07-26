import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '@/theme/theme';
import ClientLayout from '@/components/ClientLayout'; // ✅ Import this

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Land Registration System',
  description: 'POC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
