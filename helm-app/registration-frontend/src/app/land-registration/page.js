'use client';

import { Container, Typography } from '@mui/material';
import LandTitleForm from '../../components/LandTitleForm';

export default function LandRegistrationPage() {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Land Title Registration
      </Typography>
      <LandTitleForm />
    </Container>
  );
}
