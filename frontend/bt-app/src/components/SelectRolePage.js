import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Avatar,
  Stack,
  Chip,
} from '@mui/material';
import { School, Key, ArrowBack, AdminPanelSettings, PersonAdd } from '@mui/icons-material';

const SelectRolePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #4A90E2 0%, #2C5282 100%)' }}>
      {/* Header */}
      <Box
        sx={{
          color: 'white',
          py: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'translate(50%, -50%)',
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Button
              onClick={() => navigate('/')}
              sx={{ 
                color: 'white', 
                minWidth: 'auto',
                p: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ArrowBack />
            </Button>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              역할 선택
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
            역할을 선택해주세요
          </Typography>
        </Container>
      </Box>

      {/* Role Selection */}
      <Box sx={{ bgcolor: 'white', py: 8, borderRadius: { xs: 0, md: '32px 32px 0 0' }, mt: -4, position: 'relative', zIndex: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {/* 교회담당자 */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '2px solid transparent',
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #4A90E2, #2C5282) border-box',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    '& .role-bg': {
                      transform: 'scale(1.1)',
                      opacity: 0.1,
                    }
                  },
                }}
                onClick={() => navigate('/church-manager')}
              >
                {/* Background Pattern */}
                <Box
                  className="role-bg"
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #4A90E2, #2C5282)',
                    transition: 'all 0.4s ease',
                    zIndex: 0,
                  }}
                />
                
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 6, position: 'relative', zIndex: 1 }}>
                  <Avatar
                    sx={{
                                              background: 'linear-gradient(135deg, #4A90E2, #2C5282)',
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 3,
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    <AdminPanelSettings sx={{ fontSize: 50 }} />
                  </Avatar>
                  
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                    <Chip 
                      icon={<School />} 
                      label="교회단위" 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(102, 126, 234, 0.1)', 
                        color: '#667eea',
                        fontWeight: 600,
                      }} 
                    />
                  </Stack>
                  
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}
                  >
                    교회담당자
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                  >
                    교회를 대표하여 BT 프로그램 신청 및 키 관리
                  </Typography>
                  
                  <Stack spacing={1} sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4a5568' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#667eea' }} />
                      교회 정보로 신청
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4a5568' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#667eea' }} />
                      승인 후 키 발급 관리
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4a5568' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#667eea' }} />
                      교사별 키 배포
                    </Typography>
                  </Stack>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'center', pb: 4, position: 'relative', zIndex: 1 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ 
                      px: 6, 
                      py: 1.5,
                      borderRadius: 3,
                                              background: 'linear-gradient(135deg, #4A90E2, #2C5282)',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.6)',
                      }
                    }}
                  >
                    교회 신청하기
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* 개인교사 */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '2px solid transparent',
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #f093fb, #f5576c) border-box',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    '& .role-bg': {
                      transform: 'scale(1.1)',
                      opacity: 0.1,
                    }
                  },
                }}
                onClick={() => navigate('/key-input')}
              >
                {/* Background Pattern */}
                <Box
                  className="role-bg"
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                    transition: 'all 0.4s ease',
                    zIndex: 0,
                  }}
                />
                
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 6, position: 'relative', zIndex: 1 }}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 3,
                      boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
                    }}
                  >
                    <Key sx={{ fontSize: 50 }} />
                  </Avatar>
                  
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                    <Chip 
                      icon={<PersonAdd />} 
                      label="개인참가" 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(240, 147, 251, 0.1)', 
                        color: '#f093fb',
                        fontWeight: 600,
                      }} 
                    />
                  </Stack>
                  
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}
                  >
                    개인교사
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                  >
                    발급받은 키로 개인 참가 및 QR 생성
                  </Typography>
                  
                  <Stack spacing={1} sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4a5568' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f093fb' }} />
                      키 코드 입력
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4a5568' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f093fb' }} />
                      개인 정보 등록
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4a5568' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f093fb' }} />
                      QR 코드 생성
                    </Typography>
                  </Stack>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'center', pb: 4, position: 'relative', zIndex: 1 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ 
                      px: 6, 
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 20px rgba(240, 147, 251, 0.4)',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(240, 147, 251, 0.6)',
                      }
                    }}
                  >
                    키로 참가하기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default SelectRolePage;
