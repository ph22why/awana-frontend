import React from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: number;
}

const events: Event[] = [
  {
    id: '1',
    title: '2024 AWANA 리더십 컨퍼런스',
    date: '2024-06-15',
    location: '서울특별시',
    status: 'upcoming',
    participants: 150,
  },
  {
    id: '2',
    title: 'AWANA 올림피아드',
    date: '2024-09-20',
    location: '부산광역시',
    status: 'upcoming',
    participants: 300,
  },
  {
    id: '3',
    title: 'AWANA 겨울 캠프',
    date: '2024-12-27',
    location: '강원도 평창',
    status: 'upcoming',
    participants: 200,
  },
];

const getStatusText = (status: Event['status']) => {
  switch (status) {
    case 'upcoming':
      return '예정';
    case 'ongoing':
      return '진행중';
    case 'completed':
      return '완료';
    default:
      return '';
  }
};

const EventManagePage: React.FC = () => {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/admin/events/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete event:', id);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        이벤트 관리
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => navigate('/admin/events/create')}
        sx={{ mb: 3 }}
      >
        새 이벤트 만들기
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>이벤트명</TableCell>
              <TableCell>일자</TableCell>
              <TableCell>장소</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>참가자 수</TableCell>
              <TableCell align="right">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>
                  {new Date(event.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{getStatusText(event.status)}</TableCell>
                <TableCell>{event.participants}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(event.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(event.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default EventManagePage; 