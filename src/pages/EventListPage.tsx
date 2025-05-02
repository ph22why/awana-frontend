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
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // 2. 샘플이벤트 기준으로 병합
        const merged = sampleEvents.map((sample) => {
          const normalize = (name: string) => name.replace(/\d{4}/g, '').replace(/\s/g, '').toLowerCase();
          const matched = publicEvents.find(
            (db) => normalize(db.event_Name) === normalize(sample.sampleEvent_Name)
          );
          if (matched) {
            return {
              id: matched._id,
              title: matched.event_Name,
              description: matched.event_Description || sample.sampleEvent_Name,
              date: matched.event_Start_Date || matched.event_Year?.toString() || '미정',
              imageUrl: `/images/${sample.sampleEvent_Name.replace(/\s/g, '-').toLowerCase()}.jpg`,
              location: matched.event_Place || sample.sampleEvent_Place || '미정',
              isSample: false,
            };
          } else {
            return {
              id: `sample-${sample.sampleEvent_ID}`,
              title: sample.sampleEvent_Name,
              description: sample.sampleEvent_Name,
              date: '미정',
              imageUrl: `/images/${sample.sampleEvent_Name.replace(/\s/g, '-').toLowerCase()}.jpg`,
              location: sample.sampleEvent_Place || '미정',
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        이벤트 목록
      </Typography>
      {loading ? (
        <Typography align="center">불러오는 중...</Typography>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        <Grid container spacing={4}>
          {mergedEvents.map((event) => (
            <Grid item key={event.id} xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={event.imageUrl}
                  alt={event.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {event.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    일시: {event.date === '미정' ? '미정' : new Date(event.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    장소: {event.location || '미정'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    자세히 보기
                  </Button>
                  <Button size="small" color="primary">
                    신청하기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default EventListPage; 