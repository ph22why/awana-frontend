import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { eventApi, IEvent } from '../../services/api/eventApi';
import moment from 'moment';

const getEventStatus = (event: IEvent) => {
  const now = moment();
  const startDate = moment(event.event_Start_Date);
  const endDate = moment(event.event_End_Date);

  if (now.isBefore(startDate)) {
    return '예정';
  } else if (now.isAfter(endDate)) {
    return '완료';
  } else {
    return '진행중';
  }
};

const EventManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useOutletContext<{ role: string }>();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    eventId: string | null;
    eventName: string;
  }>({
    open: false,
    eventId: null,
    eventName: ''
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching events...');
      
      const fetchedEvents = await eventApi.getEvents();
      console.log('Fetched events:', fetchedEvents);
      
      if (!fetchedEvents || fetchedEvents.length === 0) {
        console.log('No events found');
        setEvents([]);
        return;
      }

      // 날짜 기준으로 내림차순 정렬 (최신순)
      const sortedEvents = [...fetchedEvents].sort((a, b) => {
        const dateA = new Date(b.createdAt || b.event_Start_Date).getTime();
        const dateB = new Date(a.createdAt || a.event_Start_Date).getTime();
        return dateA - dateB;
      });
      
      console.log('Sorted events to display:', sortedEvents);
      setEvents(sortedEvents);
    } catch (err: any) {
      const errorMessage = err.message || '이벤트 목록을 불러오는데 실패했습니다.';
      console.error('Error fetching events:', {
        error: err,
        message: errorMessage
      });
      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시와 이벤트 생성/수정/삭제 후에 목록 새로고침
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/admin/events/edit/${id}`);
  };

  const handleDeleteClick = (id: string, eventName: string) => {
    setDeleteDialog({
      open: true,
      eventId: id,
      eventName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.eventId) return;

    try {
      setLoading(true);
      await eventApi.deleteEvent(deleteDialog.eventId);
      await fetchEvents(); // 목록 새로고침
      setDeleteDialog({ open: false, eventId: null, eventName: '' });
    } catch (err: any) {
      setError(err.message || '이벤트 삭제에 실패했습니다.');
      console.error('Error deleting event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, eventId: null, eventName: '' });
  };

  if (role === 'mini') {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 2 }}>접근 권한이 없습니다.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>이벤트명</TableCell>
              <TableCell>시작일</TableCell>
              <TableCell>종료일</TableCell>
              <TableCell>접수</TableCell>
              <TableCell>지역</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>공개여부</TableCell> 
              <TableCell align="right">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events && events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>{event.event_Name}</TableCell>
                  <TableCell>
                    {moment(event.event_Start_Date).format('YYYY-MM-DD')}
                  </TableCell>
                  <TableCell>
                    {moment(event.event_End_Date).format('YYYY-MM-DD')}
                  </TableCell>
                  <TableCell>
                    {moment(event.event_Registration_Start_Date).format('YYYY-MM-DD')} ~{' '}
                    {moment(event.event_Registration_End_Date).format('YYYY-MM-DD')}
                  </TableCell>
                  <TableCell>{`${event.event_Place} (${event.event_Location})`}</TableCell>
                  <TableCell>{getEventStatus(event)}</TableCell>
                  <TableCell>{event.event_Open_Available}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(event._id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(event._id, event.event_Name)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {error ? error : '등록된 이벤트가 없습니다.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>이벤트 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{deleteDialog.eventName}" 이벤트를 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventManagePage; 