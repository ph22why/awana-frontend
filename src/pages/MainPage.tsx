import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  Paper,
} from '@mui/material';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
}

const featuredEvents: Event[] = [
  {
    id: '1',
    title: '2024 AWANA 리더십 컨퍼런스',
    description: '차세대 리더를 위한 AWANA 리더십 컨퍼런스에 여러분을 초대합니다.',
    date: '2024-06-15',
    imageUrl: '/images/conference.jpg',
  },
  {
    id: '2',
    title: 'AWANA 올림피아드',
    description: '전국 AWANA 클럽이 함께하는 스포츠 축제',
    date: '2024-09-20',
    imageUrl: '/images/olympiad.jpg',
  },
  {
    id: '3',
    title: 'AWANA 겨울 캠프',
    description: '겨울방학 특별 AWANA 캠프',
    date: '2024-12-27',
    imageUrl: '/images/camp.jpg',
  },
];

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            AWANA Events
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
          >
            Approved Workmen Are Not Ashamed
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" onClick={() => navigate('/events')}>
              이벤트 보기
            </Button>
            <Button variant="outlined" onClick={() => navigate('/churches')}>
              교회 찾기
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => navigate('/receipts')}
            >
              영수증 발급
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Receipt Section */}
      <Container sx={{ py: 4 }} maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 8, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            bgcolor: 'primary.light',
            color: 'primary.contrastText'
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom align="center">
            영수증 발급 서비스
          </Typography>
          <Typography variant="body1" align="center" paragraph sx={{ mb: 3 }}>
            AWANA 이벤트의 영수증을 온라인으로 간편하게 발급받으세요.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            onClick={() => navigate('/receipts')}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              bgcolor: 'background.paper',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'background.default',
              }
            }}
          >
            영수증 발급하기
          </Button>
        </Paper>
      </Container>

      {/* Featured Events Section */}
      <Container sx={{ py: 8 }} maxWidth="md">
        <Typography
          component="h2"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
        >
          주요 이벤트
        </Typography>
        <Grid container spacing={4}>
          {featuredEvents.map((event) => (
            <Grid item key={event.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    height: 200,
                  }}
                  image={event.imageUrl}
                  alt={event.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {event.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {event.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    일자: {new Date(event.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    자세히 보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default MainPage; 