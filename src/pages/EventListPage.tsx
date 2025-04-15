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

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  location: string;
}

const events: Event[] = [
  {
    id: '1',
    title: '2024 AWANA 리더십 컨퍼런스',
    description: '차세대 리더를 위한 AWANA 리더십 컨퍼런스에 여러분을 초대합니다.',
    date: '2024-06-15',
    imageUrl: '/images/conference.jpg',
    location: '서울특별시',
  },
  {
    id: '2',
    title: 'AWANA 올림피아드',
    description: '전국 AWANA 클럽이 함께하는 스포츠 축제',
    date: '2024-09-20',
    imageUrl: '/images/olympiad.jpg',
    location: '부산광역시',
  },
  {
    id: '3',
    title: 'AWANA 겨울 캠프',
    description: '겨울방학 특별 AWANA 캠프',
    date: '2024-12-27',
    imageUrl: '/images/camp.jpg',
    location: '강원도 평창',
  },
];

const EventListPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        이벤트 목록
      </Typography>
      <Grid container spacing={4}>
        {events.map((event) => (
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
                  일시: {new Date(event.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  장소: {event.location}
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
    </Container>
  );
};

export default EventListPage; 