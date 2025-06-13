import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Container, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';
import { eventApi } from '../../services/api/eventApi';

interface Event { id: string; name: string; place: string; }
interface Receipt { id: string; church: string; people: number; amount: number; }

const ReceiptStatusPage: React.FC = () => {
  const { role } = useOutletContext<{ role: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    if (role !== 'mini' && role !== 'admin') return;
    
    const fetchEvents = async () => {
      try {
        const eventsData = await eventApi.getEvents();
        setEvents(eventsData
          .filter((ev: any) => ev.event_Open_Available === '공개')
          .map((ev: any) => ({
            id: ev._id,
            name: ev.event_Name,
            place: ev.event_Place
          })));
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    
    fetchEvents();
  }, [role]);

  useEffect(() => {
    if (!selectedEvent) return;
    axios.get(`/api/receipts?eventId=${selectedEvent}`)
      .then(res => {
        setReceipts((res.data as any[]).map((r: any) => ({ id: r.id, church: r.churchName, people: r.people, amount: r.amount })));
      })
      .catch(() => {});
  }, [selectedEvent]);

  const handleDownload = () => {
    if (!selectedEvent) return;
    window.location.href = `/api/receipts/excel?eventId=${selectedEvent}`;
  };

  if (!(role === 'mini' || role === 'admin')) return <Container><Alert severity="error">접근 권한이 없습니다.</Alert></Container>;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>접수 현황</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>이벤트</InputLabel>
          <Select
            value={selectedEvent}
            label="이벤트"
            onChange={e => setSelectedEvent(e.target.value as string)}
            required
          >
            {events.map(ev => (
              <MenuItem key={ev.id} value={ev.id}>
                {ev.name} ({ev.place})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleDownload} sx={{ mb: 2 }}>엑셀 다운로드</Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>교회명</TableCell>
              <TableCell>인원</TableCell>
              <TableCell>금액</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipts.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.church}</TableCell>
                <TableCell>{r.people}</TableCell>
                <TableCell>{r.amount.toLocaleString()}원</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default ReceiptStatusPage; 