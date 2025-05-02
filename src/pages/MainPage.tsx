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
import { eventApi, IEvent } from '../services/api/eventApi';
import { SampleEvent } from '../types/event';
import { useEffect, useState } from 'react';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [mergedEvents, setMergedEvents] = useState<Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    imageUrl: string;
    isSample: boolean;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. DB에서 공개된 이벤트 불러오기
        const dbEvents: IEvent[] = await eventApi.getEvents();
        // 2. 샘플 이벤트 불러오기
        const sampleRes = await eventApi.getSampleEvents();
        const sampleEvents: SampleEvent[] = sampleRes.data || [];

        // 1. DB에서 공개된 이벤트만 필터링
        const publicEvents = dbEvents.filter(e => e.event_Open_Available === '공개');
        // 3. 샘플이벤트 기준으로 병합
        const merged = sampleEvents.map((sample) => {
          const normalize = (name: string) => name.replace(/\d{4}/g, '').replace(/\s/g, '').toLowerCase();
          const matched = publicEvents.find(
            (db) => normalize(db.event_Name) === normalize(sample.sampleEvent_Name)
          );
          if (matched) {
            // DB 이벤트 정보 사용
            return {
              id: matched._id,
              title: matched.event_Name,
              description: matched.event_Description || sample.sampleEvent_Name,
              date: matched.event_Start_Date || matched.event_Year?.toString() || '미정',
              imageUrl: `/images/${sample.sampleEvent_Name.replace(/\s/g, '-').toLowerCase()}.jpg`,
              isSample: false,
            };
          } else {
            // 샘플 정보 + 기간 미정
            return {
              id: `sample-${sample.sampleEvent_ID}`,
              title: sample.sampleEvent_Name,
              description: sample.sampleEvent_Name,
              date: '미정',
              imageUrl: `/images/${sample.sampleEvent_Name.replace(/\s/g, '-').toLowerCase()}.jpg`,
              isSample: true,
            };
          }
        });
        setMergedEvents(merged);
      } catch (err: any) {
        setError(err.message || '이벤트 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

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
        {loading ? (
          <Typography align="center">불러오는 중...</Typography>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
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
          {mergedEvents.map((event) => (
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
                        {event.date === '미정'
                          ? '미정'
                          : new Date(event.date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
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
        )}
      </Container>
      </Box>
    </Box>
  );
};

export default MainPage; 