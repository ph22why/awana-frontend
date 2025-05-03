import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Container, Typography, Paper, TextField, Button, Box, MenuItem, FormControl, InputLabel, Select, Grid, Alert
} from '@mui/material';
import axios from 'axios';

interface Event {
  id: string;
  name: string;
}

const OnsiteRegisterPage: React.FC = () => {
  const { role } = useOutletContext<{ role: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [form, setForm] = useState({
    regId: '',
    churchName: '',
    manager: '',
    phone: '',
    people: '',
    amount: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (role !== 'mini' && role !== 'admin') setError('접근 권한이 없습니다.');
    // 마감된 공개 이벤트 불러오기
    axios.get('/api/events?open=1&closed=1')
      .then(res => {
        setEvents((res.data as any[]).map((ev: any) => ({ id: ev.id, name: ev.name })));
      })
      .catch(() => setError('이벤트 목록을 불러오지 못했습니다.'));
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name as string]: value as string }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/onsite-register', {
        eventId: selectedEvent,
        regId: form.regId,
        churchName: form.churchName,
        manager: form.manager,
        phone: form.phone,
        people: form.people,
        amount: form.amount,
      });
      setForm({ regId: '', churchName: '', manager: '', phone: '', people: '', amount: '' });
      setError('');
      alert('등록 완료!');
    } catch {
      setError('등록에 실패했습니다.');
    }
  };

  if (!(role === 'mini' || role === 'admin')) return <Container><Alert severity="error">접근 권한이 없습니다.</Alert></Container>;

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>현장등록</Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>이벤트</InputLabel>
            <Select
              value={selectedEvent}
              label="이벤트"
              onChange={e => setSelectedEvent(e.target.value as string)}
              required
            >
              {events.map(ev => (
                <MenuItem key={ev.id} value={ev.id}>{ev.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="등록번호" name="regId" value={form.regId} onChange={handleChange} sx={{ mb: 2 }} required />
          <TextField fullWidth label="교회 이름" name="churchName" value={form.churchName} onChange={handleChange} sx={{ mb: 2 }} required />
          <TextField fullWidth label="담당자" name="manager" value={form.manager} onChange={handleChange} sx={{ mb: 2 }} required />
          <TextField fullWidth label="담당자 연락처" name="phone" value={form.phone} onChange={handleChange} sx={{ mb: 2 }} required />
          <TextField fullWidth label="인원" name="people" value={form.people} onChange={handleChange} sx={{ mb: 2 }} required />
          <TextField fullWidth label="금액" name="amount" value={form.amount} onChange={handleChange} sx={{ mb: 2 }} required />
          <Button type="submit" variant="contained" fullWidth>등록</Button>
        </form>
      </Paper>
    </Container>
  );
};

export default OnsiteRegisterPage; 