import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import {
  AdminPanelSettings,
  CheckCircle,
  Lock
} from '@mui/icons-material';

const MainPage = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePinChange = (e) => {
    setPin(e.target.value);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '2024') {
      navigate('/admin');
    } else {
      setError('Invalid PIN');
    }
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    navigate('/attendance');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary" fontWeight="bold">
          AWANA Camp Admin
        </Typography>
        <Typography variant="h6" color="text.secondary">
          관리자 패널에 오신 것을 환영합니다
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {/* Admin Access Card */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={4}
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <AdminPanelSettings sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                관리자 접근
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                학생, 교사, 스태프 정보를 관리합니다
              </Typography>
              
              <Paper 
                component="form" 
                onSubmit={handlePinSubmit}
                elevation={2}
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Lock sx={{ color: 'grey.600', mr: 1 }} />
                  <Typography variant="body1" color="text.primary" fontWeight="medium">
                    PIN 번호 입력
                  </Typography>
                </Box>
                <TextField
          type="password"
                  placeholder="PIN을 입력하세요"
          value={pin}
          onChange={handlePinChange}
          required
                  fullWidth
                  variant="outlined"
                  size="medium"
                  sx={{ mb: 2 }}
        />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    fontWeight: 'bold',
                    py: 1.5
                  }}
                >
                  관리자 페이지 접속
                </Button>
              </Paper>
              
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: 'error.main'
                  }}
                >
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Check Card */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={4}
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                출석 관리
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                캠프 참가자들의 출석을 확인하고 관리합니다
              </Typography>
              
              <Paper 
                component="form" 
                onSubmit={handleAttendanceSubmit}
                elevation={2}
                sx={{ 
                  p: 3,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="body1" color="text.primary" sx={{ mb: 3 }} fontWeight="medium">
                  출석 체크 페이지로 이동합니다
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    background: 'linear-gradient(45deg, #21CBF3 30%, #1976d2 90%)',
                    fontWeight: 'bold',
                    py: 1.5
                  }}
                >
                  출석 관리 페이지
                </Button>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          © 2024 AWANA English Camp Admin System
        </Typography>
      </Box>
    </Container>
  );
};

export default MainPage;
