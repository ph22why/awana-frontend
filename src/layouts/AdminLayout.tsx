import React, { useState, useEffect } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Church as ChurchIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Autorenew as AutorenewIcon,
  MenuBook as BTIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { text: '대시보드', path: '/admin', icon: <DashboardIcon /> },
  { text: '이벤트 관리', path: '/admin/events', icon: <EventIcon /> },
  { text: '교회 관리', path: '/admin/churches', icon: <ChurchIcon /> },
  { text: '신규등록', path: '/admin/new-registration', icon: <PersonAddIcon /> },
  { text: '재등록', path: '/admin/renew-registration', icon: <AutorenewIcon /> },
  { text: 'BT 관리', path: '/admin/bt', icon: <BTIcon /> },
  { text: '영수증 관리', path: '/admin/receipts', icon: <ReceiptIcon /> },
  { text: '현장등록', path: '/admin/onsite', icon: <ReceiptIcon /> },
  { text: '접수 현황', path: '/admin/receipt-status', icon: <ReceiptIcon /> },
];

const ADMIN_PIN = process.env.REACT_APP_ADMIN_PIN_ADMIN ?? '';
const MINI_PIN = process.env.REACT_APP_ADMIN_PIN_MINI ?? '';

const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [authOpen, setAuthOpen] = useState(true);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'mini' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role) setAuthOpen(false);
  }, [role]);

  const handleAuth = () => {
    if (ADMIN_PIN && password === ADMIN_PIN) {
      setRole('admin');
      setError('');
    } else if (MINI_PIN && password === MINI_PIN) {
      setRole('mini');
      setError('');
    } else {
      setError('암호가 올바르지 않습니다.');
    }
  };

  const isMenuDisabled = (path: string) => false;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          관리자 메뉴
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              disabled={isMenuDisabled(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/">
            <ListItemIcon>
              <ArrowBackIcon />
            </ListItemIcon>
            <ListItemText primary="" />
          </ListItemButton>
        </ListItem>
      </List> */}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            AWANA 관리자
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet context={{ role }} />
        <Dialog open={authOpen} disableEscapeKeyDown>
          <DialogTitle>관리자 인증</DialogTitle>
          <DialogContent>
            <TextField
              label="암호 입력"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleAuth(); }}
              error={!!error}
              helperText={error}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAuth} variant="contained">확인</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminLayout; 
