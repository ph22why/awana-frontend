import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import { eventApi, IEvent } from '../../services/api/eventApi';
import { churchApi, Church } from '../../services/api/churchApi';
import { receiptApi, Receipt } from '../../services/api/receiptApi';
import type { EventFormData } from '../../types/event';

const NewChurchRegistrationPage: React.FC = () => {
  const { role } = useOutletContext<{ role: string }>();
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [fixedNewEventId, setFixedNewEventId] = useState<string>('');
  const [newChurchName, setNewChurchName] = useState<string>('');
  const [newChurchLocation, setNewChurchLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<IEvent[]>([]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // 연도별 고정 이벤트 생성
  const ensureFixedEvent = async (kind: '신규등록'): Promise<string> => {
    if (!selectedYear) throw new Error('연도를 먼저 선택해주세요.');
    const targetName = `${kind} ${selectedYear}`;
    const found = events.find(ev => ev.event_Name === targetName);
    if (found) return found._id;
    
    const todayIso = new Date().toISOString();
    const month = new Date().getMonth() + 1;
    const payload: EventFormData = {
      event_Name: targetName,
      event_Location: '시스템',
      event_Year: Number(selectedYear),
      event_Start_Date: todayIso,
      event_End_Date: todayIso,
      event_Registration_Start_Date: todayIso,
      event_Registration_End_Date: todayIso,
      event_Open_Available: '비공개',
      event_Place: '시스템',
      event_Month: month
    };
    const created = await eventApi.createEvent(payload);
    setEvents(prev => [created, ...prev]);
    return created._id;
  };

  // 0000 다음 사용 가능한 subId 찾기 (a-z)
  const getNextSubIdFor0000 = async (): Promise<string | null> => {
    try {
      const res = await churchApi.searchChurches({ getAllResults: true });
      if (!res.success) return null;
      const zeros = (res.data || []).filter(c => c.mainId === '0000');
      const used = new Set(zeros.map(c => (c.subId || '').toLowerCase()));
      for (let code = 97; code <= 122; code++) {
        const ch = String.fromCharCode(code);
        if (!used.has(ch)) return ch;
      }
      return null;
    } catch (e) {
      console.error('getNextSubIdFor0000 error', e);
      return null;
    }
  };

  // 신규등록 처리 (교회 생성 + 30만원 영수증)
  const handleCreateNewChurchAndReceipt = async () => {
    if (!newChurchName.trim()) {
      setError('교회명을 입력해주세요.');
      return;
    }
    if (!selectedYear) {
      setError('연도를 먼저 선택해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      const eventId = fixedNewEventId || await ensureFixedEvent('신규등록');
      if (!fixedNewEventId) setFixedNewEventId(eventId);
      
      const nextSub = await getNextSubIdFor0000();
      if (!nextSub) {
        setError('사용 가능한 하위 ID가 없습니다.');
        return;
      }
      
      // 교회 생성
      const createdChurchRes = await churchApi.createChurch({
        mainId: '0000',
        subId: nextSub,
        name: newChurchName.trim(),
        location: newChurchLocation.trim(),
      } as any);
      
      if (!createdChurchRes.success) {
        setError('교회 생성에 실패했습니다.');
        return;
      }
      
      // 영수증 생성
      const receiptData: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'> = {
        eventId,
        churchId: { mainId: '0000', subId: nextSub },
        churchName: newChurchName.trim(),
        managerName: '.',
        managerPhone: '010-0000-0000',
        partTotal: 0,
        partStudent: 0,
        partTeacher: 0,
        partYM: 0,
        costs: 300000,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        paymentDate: new Date().toISOString(),
        description: '신규등록 자동발급'
      };
      
      const res = await receiptApi.createReceipt(receiptData);
      if (res.success) {
        setSnackbar({ 
          open: true, 
          message: `신규등록 완료: ${newChurchName} (0000-${nextSub}) 교회가 등록되고 300,000원 영수증이 발급되었습니다.`, 
          severity: 'success' 
        });
        setNewChurchName('');
        setNewChurchLocation('');
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || '신규등록 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const year = event.target.value as number;
    setSelectedYear(year);
  };

  // 초기 연도 목록 로드
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        setLoading(true);
        const allEvents = await eventApi.getEvents();
        const years = Array.from(new Set(allEvents.map(event => event.event_Year)));
        const sortedYears = years.sort((a, b) => b - a);
        setAvailableYears(sortedYears);
        
        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]);
        }
      } catch (err) {
        console.error('Error fetching years:', err);
        setError('연도 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableYears();
  }, []);

  // 선택된 연도에 해당하는 이벤트 로드
  useEffect(() => {
    const fetchEventsByYear = async () => {
      if (!selectedYear) return;
      
      try {
        setLoading(true);
        const allEvents = await eventApi.getEvents();
        const eventsForYear = allEvents.filter(event => event.event_Year === selectedYear);
        setEvents(eventsForYear);
        
        // 고정 이벤트 확인/생성
        const targetName = `신규등록 ${selectedYear}`;
        const found = eventsForYear.find(ev => ev.event_Name === targetName);
        if (found) {
          setFixedNewEventId(found._id);
        } else {
          const eventId = await ensureFixedEvent('신규등록');
          setFixedNewEventId(eventId);
        }
      } catch (err) {
        console.error('Error fetching events for year:', err);
        setError('이벤트 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventsByYear();
  }, [selectedYear]);

  if (role === 'mini') {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 2 }}>접근 권한이 없습니다.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        신규 교회 등록
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>연도</InputLabel>
              <Select
                value={selectedYear}
                label="연도"
                onChange={handleYearChange}
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}년
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          신규 교회 정보
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField 
              fullWidth 
              label="교회명" 
              value={newChurchName} 
              onChange={(e) => setNewChurchName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField 
              fullWidth 
              label="주소/지역" 
              value={newChurchLocation} 
              onChange={(e) => setNewChurchLocation(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Alert severity="info">
              신규등록 시 교회ID는 0000, 하위ID는 a-z 중 비어있는 값이 자동 배정됩니다. 
              영수증 300,000원이 즉시 발급됩니다.
            </Alert>
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCreateNewChurchAndReceipt} 
              disabled={loading || !selectedYear || !newChurchName.trim()}
              size="large"
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : '신규등록 처리'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewChurchRegistrationPage;
