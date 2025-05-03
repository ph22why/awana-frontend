import React, { useState } from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Link,
  Drawer,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ width: 220 }} role="presentation" onClick={handleDrawerToggle}>
      <Button color="inherit" component={RouterLink} to="/events" sx={{ width: '100%' }}>이벤트</Button>
      <Button color="inherit" component={RouterLink} to="/churches" sx={{ width: '100%' }}>교회</Button>
      <Button color="inherit" component={RouterLink} to="/receipts" sx={{ width: '100%' }}>영수증 발급</Button>
      {/* <Button color="inherit" component={RouterLink} to="/admin" sx={{ width: '100%' }}>관리자</Button> */}
    </Box>
  );

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
          {/* 데스크탑 메뉴 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
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
          </Box>
          {/* 모바일 메뉴(햄버거) */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Button color="inherit" onClick={handleDrawerToggle} sx={{ minWidth: 0, p: 1 }}>
              <MenuIcon />
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Drawer */}
      <Box component="nav">
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {drawer}
        </Drawer>
      </Box>

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