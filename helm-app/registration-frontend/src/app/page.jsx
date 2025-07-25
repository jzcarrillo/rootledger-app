'use client';

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';

import { useEffect, useState } from 'react';
import axios from 'axios';

const statusColor = {
  ACTIVE: 'success',
  CANCELLED: 'error',
  PENDING: 'warning',
  'UNDER INVESTIGATION': 'default',
};

export default function HomePage() {
  const [landTitles, setLandTitles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandTitles = async () => {
      try {
        const res = await axios.get(`http://backend-service.helm-app.svc.cluster.local:3000/process`);
        setLandTitles(res.data);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandTitles();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Land Titles Summary
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Title No</strong></TableCell>
                <TableCell><strong>Owner</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Area (sqm)</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {landTitles.map((title) => (
                <TableRow key={title.title_no}>
                  <TableCell>{title.title_no}</TableCell>
                  <TableCell>{title.owner}</TableCell>
                  <TableCell>{title.location}</TableCell>
                  <TableCell>{title.area}</TableCell>
                  <TableCell>
                    <Chip
                      label={title.status}
                      color={statusColor[title.status] || 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
