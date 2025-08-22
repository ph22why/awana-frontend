import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
} from '@mui/material';
import { School, Person, Stars, Lightbulb } from '@mui/icons-material';

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          pt: 8,
          pb: 8,
          overflow: 'hidden',
        }}
      >
        {/* Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            zIndex: 0,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', color: 'white', mb: 6 }}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
              <Chip 
                icon={<Stars />} 
                label="2025" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                }} 
              />
              <Chip 
                icon={<Lightbulb />} 
                label="Bible Training" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                }} 
              />
            </Stack>
            
            <Typography
              component="h1"
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AWANA BT
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                fontWeight: 300,
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              성경 교육과 훈련을 통해 차세대 리더를 양성합니다
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/select-role')}
              sx={{
                px: 6,
                py: 2.5,
                fontSize: '1.2rem',
                borderRadius: 5,
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.95)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              신청하기
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Information Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h4"
            align="center"
            color="text.primary"
            gutterBottom
            sx={{ mb: 6, fontWeight: 700 }}
          >
            2025 BT 프로그램
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            <Card 
              sx={{ 
                borderRadius: 4,
                border: '1px solid #e3f2fd',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700, color: '#1976d2' }}>
                  상반기 BT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  봄학기 성경교육 및 교사 훈련 프로그램으로, 체계적인 커리큘럼을 통해 진행됩니다.
                </Typography>
              </CardContent>
            </Card>
            
            <Card 
              sx={{ 
                borderRadius: 4,
                border: '1px solid #f3e5f5',
                background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  하반기 BT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  가을학기 심화 성경교육으로, 실전 경험과 이론을 병행하여 진행됩니다.
                </Typography>
              </CardContent>
            </Card>
            
            <Card 
              sx={{ 
                borderRadius: 4,
                border: '1px solid #e8f5e8',
                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700, color: '#388e3c' }}>
                  수시 BT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  특별 상황이나 긴급한 교육 필요에 따라 수시로 개설되는 집중 훈련입니다.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainPage;
