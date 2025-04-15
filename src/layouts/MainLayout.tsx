import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Link,
} from '@mui/material';

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
            }}
          >
            AWANA
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/events"
            sx={{ mx: 1 }}
          >
            이벤트
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/churches"
            sx={{ mx: 1 }}
          >
            교회
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/receipts"
            sx={{ mx: 1 }}
          >
            영수증 발급
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/admin"
            sx={{ mx: 1 }}
          >
            관리자
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://awanakorea.net/">
              AWANA
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout; 