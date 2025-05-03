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
    startTime?: string;
    endTime?: string;
    url?: string;
    eventEndDate?: string;
    registrationStartDate?: string;
    registrationEndDate?: string;
    eventStartTime?: string;
    eventEndTime?: string;
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
        // 2. 접수 활성화(오늘이 접수 시작~종료 사이) 이벤트만 필터링
        const nowTime = Date.now();
        const activeEvents = publicEvents.filter(e => {
          if (!e.event_Registration_Start_Date || !e.event_Registration_End_Date) return false;
          const startDate = e.event_Registration_Start_Date.split('T')[0];
          const endDate = e.event_Registration_End_Date.split('T')[0];
          const startTime = e.event_Registration_Start_Time || '00:00';
          const endTime = e.event_Registration_End_Time || '23:59';
          const start = Date.parse(`${startDate}T${startTime}:00`);
          const end = Date.parse(`${endDate}T${endTime}:59`);
          return start <= nowTime && nowTime <= end;
        });
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
              startTime: matched.event_Registration_Start_Time,
              endTime: matched.event_Registration_End_Time,
              url: matched.event_Link,
              eventEndDate: matched.event_End_Date,
              registrationStartDate: matched.event_Registration_Start_Date,
              registrationEndDate: matched.event_Registration_End_Date,
              // 이벤트 시작/종료 시간 필드는 없음 (시간 미정으로 표시)
            };
          } else {
            // 샘플 정보 + 기간 미정
            return null;
          }
        }).filter(Boolean);
        setMergedEvents(merged as typeof mergedEvents);
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
            접수 중 이벤트
        </Typography>
        {loading ? (
          <Typography align="center">불러오는 중...</Typography>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          mergedEvents.length === 0 ? (
            <Typography align="center" sx={{ color: 'text.secondary', py: 8, fontSize: 20 }}>
              활성화된 이벤트가 없습니다.
            </Typography>
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
                  <Grid item key={event.id} xs={12} sm={6} md={4} style={{ marginTop: "10px" }}>
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
                      {/* <CardMedia
                        component="img"
                        sx={{
                          height: 200,
                          objectFit: 'cover',
                        }}
                        image={event.imageUrl}
                        alt={event.title}
                      /> */}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                          {event.title}
                          {(() => {
                            // 마감 상태면 [마감] 표시
                            const now = Date.now();
                            let regEnd = null;
                            let eventEnd = null;
                            if (event.endTime && event.date) {
                              regEnd = Date.parse(`${event.date.split('T')[0]}T${event.endTime}:59`);
                            }
                            if (event.eventEndDate) {
                              eventEnd = Date.parse(event.eventEndDate);
                              const eventEndWithTime = new Date(eventEnd);
                              eventEndWithTime.setHours(23, 59, 59, 999);
                              if (regEnd && now > regEnd && now <= eventEndWithTime.getTime()) {
                                return <span style={{ color: '#F87171', marginLeft: 8, fontSize: 18 }}>[마감]</span>;
                              }
                            }
                            return null;
                          })()}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          {event.description}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}
                        >
                          <CalendarMonth fontSize="small" />
                          {event.date === '미정'
                            ? '미정'
                            : event.eventEndDate
                              ? `${new Date(event.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} ~ ${new Date(event.eventEndDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`
                              : new Date(event.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                      </CardContent>
                      <Divider sx={{ mx: 2 }} />
                      <CardActions sx={{ p: 2 }}>
                        {(() => {
                          // 접수기간 계산
                          const now = Date.now();
                          let regStart = null;
                          let regEnd = null;
                          if (event.startTime && event.registrationStartDate) {
                            regStart = Date.parse(`${event.registrationStartDate.split('T')[0]}T${event.startTime}:00`);
                          }
                          if (event.endTime && event.registrationEndDate) {
                            regEnd = Date.parse(`${event.registrationEndDate.split('T')[0]}T${event.endTime}:59`);
                          }
                          if (regStart && regEnd && now >= regStart && now <= regEnd) {
                            // 접수기간 중
                            return (
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={() => {
                                  if (event.url) {
                                    window.open(event.url, '_blank');
                                  } else {
                                    alert('접수폼이 준비되지 않았습니다.');
                                  }
                                }}
                                sx={{
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  '&:hover': {
                                    bgcolor: 'primary.dark',
                                  }
                                }}
                              >
                                접수신청
                              </Button>
                            );
                          } else if (regEnd && event.eventEndDate) {
                            // 마감~이벤트종료까지
                            const eventEnd = Date.parse(event.eventEndDate);
                            const eventEndWithTime = new Date(eventEnd);
                            eventEndWithTime.setHours(23, 59, 59, 999);
                            if (now > regEnd && now <= eventEndWithTime.getTime()) {
                              return (
                                <Button fullWidth variant="contained" disabled sx={{ bgcolor: 'grey.400', color: 'white' }}>
                                  접수마감
                                </Button>
                              );
                            }
                          }
                          // 그 외(접수 전/이벤트 종료 후)
                          return null;
                        })()}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
        )}
      </Container>
      </Box>
    </Box>
  );
};

export default MainPage; 