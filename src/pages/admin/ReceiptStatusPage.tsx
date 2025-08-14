import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Container, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';
import axios from 'axios';
import { eventApi } from '../../services/api/eventApi';
import type { IEventGroup, IEvent } from '../../services/api/eventApi';

interface Event { id: string; name: string; place: string; year?: number }
interface Receipt { id: string; church: string; people: number; amount: number; }

const ReceiptStatusPage: React.FC = () => {
  const { role } = useOutletContext<{ role: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<IEventGroup[]>([]);
  const [selectedSelection, setSelectedSelection] = useState(''); // 'event:<id>' | 'group:<id>'
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | ''>('');

  useEffect(() => {
    if (role !== 'mini' && role !== 'admin') return;
    const fetchData = async () => {
      try {
        const [evs, grps] = await Promise.all([eventApi.getEvents(), eventApi.getEventGroups()]);
        const publicEvents = evs.filter((ev: IEvent) => ev.event_Open_Available === '공개');
        setEvents(publicEvents.map((ev: IEvent) => ({ id: ev._id, name: ev.event_Name, place: ev.event_Place, year: ev.event_Year })));
        setGroups(grps || []);
        const years = Array.from(new Set(publicEvents.map(e => e.event_Year))).sort((a, b) => b - a);
        setAvailableYears(years);
        if (years.length > 0) setSelectedYear(years[0]);
      } catch (error) {
        console.error('Error fetching events/groups:', error);
      }
    };
    fetchData();
  }, [role]);

  // 필터링된 이벤트/그룹 (연도 기준)
  const filteredEvents = selectedYear ? events.filter(e => e.year === selectedYear) : events;
  const groupsForYear = groups.filter(g => g.eventIds.some(id => filteredEvents.some(e => e.id === id)));
  const groupedEventIdSet = new Set<string>(groupsForYear.flatMap(g => g.eventIds));
  const ungroupedEvents = filteredEvents.filter(e => !groupedEventIdSet.has(e.id));

  useEffect(() => {
    if (!selectedSelection) return;
    const [mode, id] = selectedSelection.split(':');
    const params = mode === 'group'
      ? { eventIds: (groups.find(g => g._id === id)?.eventIds || []).join(',') }
      : { eventId: id };
    axios.get<any>('/api/receipts', { params })
      .then(res => {
        const body: any = res.data as any;
        const list = Array.isArray(body) ? body : (body?.data || []);
        setReceipts(list.map((r: any) => ({ id: r._id || r.id, church: r.churchName, people: r.partTotal, amount: r.costs })));
      })
      .catch(() => {});
  }, [selectedSelection]);

  const handleDownload = () => {
    if (!selectedSelection) return;
    const [mode, id] = selectedSelection.split(':');
    if (mode === 'group') {
      const ids = (groups.find(g => g._id === id)?.eventIds || []).join(',');
      window.location.href = `/api/receipts/excel?eventIds=${ids}`;
    } else {
      window.location.href = `/api/receipts/excel?eventId=${id}`;
    }
  };

  if (!(role === 'mini' || role === 'admin')) return <Container><Alert severity="error">접근 권한이 없습니다.</Alert></Container>;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>접수 현황</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>이벤트/그룹</InputLabel>
          <Select
            value={selectedSelection}
            label="이벤트/그룹"
            onChange={e => setSelectedSelection(e.target.value as string)}
            required
          >
            {groupsForYear.length > 0 && (
              <MenuItem value="" disabled>— 그룹 —</MenuItem>
            )}
            {groupsForYear.map(g => (
              <MenuItem key={g._id} value={`group:${g._id}`}>
                그룹: {g.name}
              </MenuItem>
            ))}
            {ungroupedEvents.length > 0 && (
              <MenuItem value="" disabled>— 개별 이벤트 —</MenuItem>
            )}
            {ungroupedEvents.map(ev => (
              <MenuItem key={ev.id} value={`event:${ev.id}`}>
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