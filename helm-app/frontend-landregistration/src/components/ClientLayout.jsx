'use client';

import { Box, Toolbar } from '@mui/material'; // ✅ Add this
import Sidebar from './Sidebar';

export default function ClientLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
