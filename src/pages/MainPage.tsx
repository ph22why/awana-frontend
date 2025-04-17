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
  Divider,
} from '@mui/material';
import {
  CalendarMonth,
  School,
  Receipt,
} from '@mui/icons-material';

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
    title: '성경퀴즈대회',
    description: '새해를 시작하며 진행되는 AWANA 성경퀴즈대회',
    date: '2024-01',
    imageUrl: '/images/bible-quiz.jpg',
  },
  {
    id: '2',
    title: 'YM Summit',
    description: '청소년 사역자들을 위한 리더십 훈련 프로그램',
    date: '2024-01',
    imageUrl: '/images/summit.jpg',
  },
  {
    id: '3',
    title: '상반기 연합 BT',
    description: '상반기 AWANA 연합 지도자 훈련',
    date: '2024-02',
    imageUrl: '/images/training.jpg',
  },
  {
    id: '4',
    title: '컨퍼런스',
    description: 'AWANA 사역자들을 위한 전국 컨퍼런스',
    date: '2024-03',
    imageUrl: '/images/conference.jpg',
  },
  {
    id: '5',
    title: '올림픽 설명회',
    description: '2024 AWANA 올림픽 준비를 위한 설명회',
    date: '2024-04',
    imageUrl: '/images/olympic-info.jpg',
  },
  {
    id: '6',
    title: '올림픽',
    description: '전국 AWANA 클럽이 함께하는 체육대회',
    date: '2024-05',
    imageUrl: '/images/olympic.jpg',
  },
  {
    id: '7',
    title: '조정관 학교 101',
    description: 'AWANA 조정관 기초 과정 교육',
    date: '2024-06',
    imageUrl: '/images/commander101.jpg',
  },
  {
    id: '8',
    title: '조정관 학교 201',
    description: 'AWANA 조정관 심화 과정 교육',
    date: '2024-06',
    imageUrl: '/images/commander201.jpg',
  },
  {
    id: '9',
    title: 'T&T Camp',
    description: 'Truth & Training 여름 캠프',
    date: '2024-07',
    imageUrl: '/images/tt-camp.jpg',
  },
  {
    id: '10',
    title: '감독관 학교 101',
    description: 'AWANA 감독관 양성 과정',
    date: '2024-08',
    imageUrl: '/images/director101.jpg',
  },
  {
    id: '11',
    title: 'YM MIT',
    description: '청소년 사역자 훈련 프로그램',
    date: '2024-08',
    imageUrl: '/images/ym-mit.jpg',
  },
  {
    id: '12',
    title: '하반기 연합 BT',
    description: '하반기 AWANA 연합 지도자 훈련',
    date: '2024-09',
    imageUrl: '/images/bt-training.jpg',
  },
  {
    id: '13',
    title: '영성수련회',
    description: 'AWANA 지도자를 위한 영성 수련회',
    date: '2024-10',
    imageUrl: '/images/retreat.jpg',
  },
  {
    id: '14',
    title: '성경퀴즈대회 설명회',
    description: '2025년 성경퀴즈대회 준비를 위한 설명회',
    date: '2024-11',
    imageUrl: '/images/quiz-info.jpg',
  },
  {
    id: '15',
    title: '비전캠프',
    description: '연말 AWANA 비전 캠프',
    date: '2024-12',
    imageUrl: '/images/vision-camp.jpg',
  }
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
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 100%)',
            zIndex: 0,
          }
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
            AWANA Events
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
            Approved Workmen Are Not Ashamed
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/events')}
              startIcon={<CalendarMonth />}
              sx={{
                color: '#F59E0B',
                borderColor: '#F59E0B',
                borderWidth: 2,
                px: 3,
                '&:hover': {
                  borderColor: '#D97706',
                  borderWidth: 2,
                  bgcolor: 'transparent',
                }
              }}
            >
              이벤트 보기
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate('/churches')}
              startIcon={<School />}
              sx={{
                color: '#F59E0B',
                borderColor: '#F59E0B',
                borderWidth: 2,
                px: 3,
                '&:hover': {
                  borderColor: '#D97706',
                  borderWidth: 2,
                  bgcolor: 'transparent',
                }
              }}
            >
              교회 찾기
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/receipts')}
              startIcon={<Receipt />}
              sx={{
                color: '#F59E0B',
                borderColor: '#F59E0B',
                borderWidth: 2,
                px: 3,
                '&:hover': {
                  borderColor: '#D97706',
                  borderWidth: 2,
                  bgcolor: 'transparent',
                }
              }}
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
            color: 'primary.contrastText',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
              zIndex: 1,
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            영수증 발급 서비스
          </Typography>
            <Typography variant="body1" align="center" paragraph sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
            AWANA 이벤트의 영수증을 온라인으로 간편하게 발급받으세요.
          </Typography>
          <Button 
              variant="outlined"
            size="large"
            onClick={() => navigate('/receipts')}
            sx={{ 
                px: 6,
              py: 1.5,
              fontSize: '1.1rem',
                color: '#FFFFFF',
                borderColor: '#FFFFFF',
                borderWidth: 2,
                borderRadius: 3,
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.3s ease-in-out',
                },
              '&:hover': {
                  borderColor: '#FFFFFF',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&::before': {
                    transform: 'translateX(0)',
                  },
                },
                '&:active': {
                  transform: 'translateY(0)',
              }
            }}
          >
            영수증 발급하기
          </Button>
          </Box>
        </Paper>
      </Container>

      {/* Featured Events Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
        <Typography
          component="h2"
            variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
            sx={{ 
              mb: 6,
              fontWeight: 700,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                bgcolor: 'primary.main',
                borderRadius: 2,
              }
            }}
          >
            이벤트 목록
        </Typography>
          <Box sx={{ 
            maxHeight: '600px', 
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'background.paper',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.light',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'primary.main',
              },
            },
          }}>
        <Grid container spacing={4}>
          {featuredEvents.map((event) => (
            <Grid item key={event.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    height: 200,
                        objectFit: 'cover',
                  }}
                  image={event.imageUrl}
                  alt={event.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    {event.title}
                  </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>
                  <Typography
                    variant="body2"
                        color="primary"
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontWeight: 500
                        }}
                  >
                        <CalendarMonth fontSize="small" />
                        {new Date(event.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long'
                        })}
                  </Typography>
                </CardContent>
                    <Divider sx={{ mx: 2 }} />
                    <CardActions sx={{ p: 2 }}>
                  <Button
                        fullWidth
                        variant="contained"
                    onClick={() => navigate(`/events/${event.id}`)}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          }
                        }}
                  >
                    자세히 보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
          </Box>
      </Container>
      </Box>
    </Box>
  );
};

export default MainPage; 