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
} from '@mui/material';
import { School, Person } from '@mui/icons-material';

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0) 100%)',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 4,
            }}
          >
            AWANA BT
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
            sx={{
              mb: 6,
              fontWeight: 300,
            }}
          >
            Bible Teaching & Training
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            paragraph
            sx={{ mb: 4 }}
          >
            BT 프로그램에 참여하실 분을 선택해주세요
          </Typography>
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/select-role')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                borderRadius: 3,
              }}
            >
              시작하기
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Information Section */}
      <Container sx={{ py: 6 }} maxWidth="lg">
        <Typography
          component="h2"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
        >
          BT 프로그램 안내
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Card sx={{ maxWidth: 400, flex: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                상반기 BT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                상반기에 진행되는 성경교육 및 훈련 프로그램입니다.
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ maxWidth: 400, flex: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                하반기 BT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                하반기에 진행되는 성경교육 및 훈련 프로그램입니다.
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ maxWidth: 400, flex: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                수시 BT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                필요에 따라 수시로 진행되는 특별 훈련 프로그램입니다.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default MainPage;
