import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
} from '@mui/material';
import { eventApi, IEvent } from '../services/api/eventApi';
import { SampleEvent } from '../types/event';
import { useEffect, useState } from 'react';

const EventListPage: React.FC = () => {
  const [mergedEvents, setMergedEvents] = useState<Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    imageUrl: string;
    location: string;
    isSample: boolean;
    place?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<string>('전체');
  const [regionList, setRegionList] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const dbEvents: IEvent[] = await eventApi.getEvents();
        const sampleRes = await eventApi.getSampleEvents();
        const sampleEvents: SampleEvent[] = sampleRes.data || [];
        // 1. DB에서 공개된 이벤트만 필터링
        const publicEvents = dbEvents.filter(e => e.event_Open_Available === '공개');
        // 지역 목록 추출 (중복 제거)
        const regionSet = new Set<string>();
        publicEvents.forEach(ev => {
          if (ev.event_Place) regionSet.add(ev.event_Place);
        });
        setRegionList(['전체', ...Array.from(regionSet)]);
        // 2. 샘플이벤트 기준으로 병합
        const merged = sampleEvents.flatMap((sample) => {
          const normalize = (name: string) => name.replace(/\d{4}/g, '').replace(/\s/g, '').toLowerCase();
          // 동일 이름의 공개 이벤트 여러개(지역별) 매칭
          const matchedList = publicEvents.filter(
            (db) => normalize(db.event_Name) === normalize(sample.sampleEvent_Name)
          );
          if (matchedList.length > 0) {
            return matchedList.map(matched => ({
              id: matched._id,
              title: matched.event_Name,
              description: matched.event_Description || sample.sampleEvent_Name,
              date: matched.event_Start_Date || matched.event_Year?.toString() || '미정',
              imageUrl: `/images/${sample.sampleEvent_Name.replace(/\s/g, '-').toLowerCase()}.jpg`,
              location: matched.event_Place || sample.sampleEvent_Place || '미정',
              isSample: false,
              place: matched.event_Place,
            }));
          } else {
            return [{
              id: `sample-${sample.sampleEvent_ID}`,
              title: sample.sampleEvent_Name,
              description: sample.sampleEvent_Name,
              date: '미정',
              imageUrl: `/images/${sample.sampleEvent_Name.replace(/\s/g, '-').toLowerCase()}.jpg`,
              location: sample.sampleEvent_Place || '미정',
              isSample: true,
              place: sample.sampleEvent_Place || '미정',
            }];
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

  // 분류 기준 배열
  const eventNames = [
    '성경퀴즈대회', '컨퍼런스', '올림픽 설명회', '올림픽', 'T&T Camp', '영성수련회',
  ];
  const eduNames = [
    '상반기 연합 BT', '하반기 연합 BT', '조정관 학교 1101', '조정관 학교 201', '감독관 학교 101', '수시BT',
  ];
  const abroadNames = [
    'YM Summit', 'YM MIT', '장학캠프',
  ];

  // 1. 활성 및 예정: 공개 + 오늘 이후 시작(종료 안된) 이벤트 (지역별 필터)
  const now = Date.now();
  const activeEvents = mergedEvents.filter(e => {
    if (e.isSample) return false;
    if (region !== '전체' && e.place !== region) return false;
    if (!e.date || e.date === '미정') return false;
    const end = Date.parse(e.date);
    return end >= now;
  });

  // 하단 리스트: 샘플이벤트만
  const sampleEventsOnly = mergedEvents.filter(e => e.isSample);
  const eventEvents = sampleEventsOnly.filter(e => eventNames.some(name => e.title.replace(/\d{4}/g, '').includes(name)));
  const eduEvents = sampleEventsOnly.filter(e => eduNames.some(name => e.title.replace(/\d{4}/g, '').includes(name)));
  const abroadEvents = sampleEventsOnly.filter(e => abroadNames.some(name => e.title.replace(/\d{4}/g, '').includes(name)));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        전체 이벤트 목록
      </Typography>
      {loading ? (
        <Typography align="center">불러오는 중...</Typography>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        <>

          {/* 2. 이벤트 (샘플이벤트만) */}
          <Typography variant="h5" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>이벤트</Typography>
          <Grid container spacing={4}>
            {eventEvents.length === 0 ? (
              <Grid item xs={12}><Typography align="center" color="text.secondary">해당 이벤트가 없습니다.</Typography></Grid>
            ) : eventEvents.map((event) => (
              <Grid item key={event.id} xs={12}>
                <Card sx={{ display: { xs: 'block', sm: 'flex' }, height: { xs: 'auto', sm: 120 }, minHeight: 120 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <CardContent sx={{ flex: '1 0 auto', py: 0, px: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                      <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: 18, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.description}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: 'text.secondary', mb: 0.5 }}>
                        <span>일시: {event.date === '미정' ? '미정' : new Date(event.date).toLocaleDateString()}</span>
                        <span>|</span>
                        <span>지역: {event.location || '미정'}</span>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ py: 0, px: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button size="small" color="primary">자세히 보기</Button>
                      <Button size="small" color="primary">신청하기</Button>
                    </CardActions>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* 3. 교육 (샘플이벤트만) */}
          <Typography variant="h5" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>교육</Typography>
          <Grid container spacing={4}>
            {eduEvents.length === 0 ? (
              <Grid item xs={12}><Typography align="center" color="text.secondary">해당 이벤트가 없습니다.</Typography></Grid>
            ) : eduEvents.map((event) => (
              <Grid item key={event.id} xs={12}>
                <Card sx={{ display: { xs: 'block', sm: 'flex' }, height: { xs: 'auto', sm: 120 }, minHeight: 120 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <CardContent sx={{ flex: '1 0 auto', py: 0, px: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                      <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: 18, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.description}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: 'text.secondary', mb: 0.5 }}>
                        <span>일시: {event.date === '미정' ? '미정' : new Date(event.date).toLocaleDateString()}</span>
                        <span>|</span>
                        <span>지역: {event.location || '미정'}</span>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ py: 0, px: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button size="small" color="primary">자세히 보기</Button>
                      <Button size="small" color="primary">신청하기</Button>
                    </CardActions>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* 4. 해외 캠프 (샘플이벤트만) */}
          <Typography variant="h5" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>해외 캠프</Typography>
          <Grid container spacing={4}>
            {abroadEvents.length === 0 ? (
              <Grid item xs={12}><Typography align="center" color="text.secondary">해당 이벤트가 없습니다.</Typography></Grid>
            ) : abroadEvents.map((event) => (
              <Grid item key={event.id} xs={12}>
                <Card sx={{ display: { xs: 'block', sm: 'flex' }, height: { xs: 'auto', sm: 120 }, minHeight: 120 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <CardContent sx={{ flex: '1 0 auto', py: 0, px: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                      <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: 18, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.description}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: 'text.secondary', mb: 0.5 }}>
                        <span>일시: {event.date === '미정' ? '미정' : new Date(event.date).toLocaleDateString()}</span>
                        <span>|</span>
                        <span>지역: {event.location || '미정'}</span>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ py: 0, px: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button size="small" color="primary">자세히 보기</Button>
                      <Button size="small" color="primary">신청하기</Button>
                    </CardActions>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default EventListPage; 