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
  Autocomplete,
  Chip,
  Stack,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import { eventApi, IEvent } from '../../services/api/eventApi';
import { churchApi, Church } from '../../services/api/churchApi';
import { receiptApi, Receipt } from '../../services/api/receiptApi';
import type { EventFormData } from '../../types/event';

const RenewChurchRegistrationPage: React.FC = () => {
  const { role } = useOutletContext<{ role: string }>();
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [fixedRenewEventId, setFixedRenewEventId] = useState<string>('');
  const [renewChurch, setRenewChurch] = useState<Church | null>(null);
  const [renewClubs, setRenewClubs] = useState<string>('1');
  const [renewCounts, setRenewCounts] = useState<{ done: number; pending: number }>({ done: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);

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
  const ensureFixedEvent = async (kind: '재등록'): Promise<string> => {
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

  // 교회 검색
  const handleChurchSearch = async (value: string) => {
    if (!value || value.length < 2) {
      setChurches([]);
      return;
    }

    try {
      setLoading(true);
      const isMainId = /^\d{4}$/.test(value);
      let searchParams = {};
      
      if (isMainId) {
        searchParams = { mainId: value };
      } else {
        searchParams = { name: value };
      }

      const response = await churchApi.searchChurches({
        ...searchParams,
        getAllResults: true
      });

      if (response.success) {
        setChurches(response.data);
      }
    } catch (err) {
      console.error('Error searching churches:', err);
      setError('교회 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 재등록 처리 (클럽 수 * 50,000원 영수증)
  const handleCreateRenewReceipt = async () => {
    if (!renewChurch) {
      setError('교회를 선택해주세요.');
      return;
    }
    const clubs = parseInt(renewClubs, 10) || 0;
    if (clubs <= 0) {
      setError('클럽 수를 1 이상 입력해주세요.');
      return;
    }
    if (!selectedYear) {
      setError('연도를 먼저 선택해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      const eventId = fixedRenewEventId || await ensureFixedEvent('재등록');
      if (!fixedRenewEventId) setFixedRenewEventId(eventId);
      
      const receiptData: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'> = {
        eventId,
        churchId: { mainId: renewChurch.mainId, subId: renewChurch.subId },
        churchName: renewChurch.name,
        managerName: '.',
        managerPhone: '010-0000-0000',
        partTotal: 0,
        partStudent: 0,
        partTeacher: 0,
        partYM: 0,
        costs: clubs * 50000,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        paymentDate: new Date().toISOString(),
        description: `재등록 (클럽 ${clubs}개)`
      };
      
      const res = await receiptApi.createReceipt(receiptData);
      if (res.success) {
        setSnackbar({ 
          open: true, 
          message: `재등록 완료: ${renewChurch.name} 교회의 ${clubs}개 클럽에 대한 ${(clubs * 50000).toLocaleString()}원 영수증이 발급되었습니다.`, 
          severity: 'success' 
        });
        await refreshRenewCounts(eventId);
        setRenewChurch(null);
        setRenewClubs('1');
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || '재등록 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const refreshRenewCounts = async (eventId: string) => {
    try {
      const [churchRes, receiptRes] = await Promise.all([
        churchApi.searchChurches({ getAllResults: true, page: 1, limit: 10000 }),
        receiptApi.getReceipts({ eventId, limit: 5000 })
      ]);
      const totalChurches = churchRes.success ? (churchRes.data?.length || 0) : 0;
      const completedSet = new Set((receiptRes.data || []).map(r => `${r.churchId.mainId}-${r.churchId.subId}`));
      const done = completedSet.size;
      const pending = Math.max(0, totalChurches - done);
      setRenewCounts({ done, pending });
    } catch (e) {
      console.error('Failed to refresh renew counts', e);
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
        const targetName = `재등록 ${selectedYear}`;
        const found = eventsForYear.find(ev => ev.event_Name === targetName);
        if (found) {
          setFixedRenewEventId(found._id);
          await refreshRenewCounts(found._id);
        } else {
          const eventId = await ensureFixedEvent('재등록');
          setFixedRenewEventId(eventId);
          await refreshRenewCounts(eventId);
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
        교회 재등록
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
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Stack direction="row" spacing={1}>
                <Chip color="success" label={`재등록 완료 ${renewCounts.done}개`} />
                <Chip color="default" label={`미완료 ${renewCounts.pending}개`} />
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          재등록 정보
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Autocomplete
              value={renewChurch}
              onChange={(_, v) => setRenewChurch(v)}
              options={churches}
              onInputChange={(_, v) => { 
                if (v.length >= 2) handleChurchSearch(v); 
              }}
              getOptionLabel={(o) => (o ? `${o.name} (${o.mainId}-${o.subId})` : '')}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="교회 선택(이름/등록번호로 검색)" 
                  fullWidth
                  helperText="교회명이나 4자리 등록번호를 입력하세요"
                />
              )}
              isOptionEqualToValue={(o, v) => o.mainId === v.mainId && o.subId === v.subId}
              renderOption={(props, option) => (
                <li {...props}>
                  <Typography>
                    {option.name} <Typography component="span" color="textSecondary">({option.mainId}-{option.subId})</Typography>
                  </Typography>
                </li>
              )}
              loading={loading}
              loadingText="검색중..."
              noOptionsText="검색 결과가 없습니다"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField 
              fullWidth 
              label="클럽 수" 
              type="number" 
              inputProps={{ min: 1 }} 
              value={renewClubs} 
              onChange={(e) => setRenewClubs(e.target.value)} 
              helperText="클럽당 50,000원"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={`예상 비용: ${(Math.max(1, parseInt(renewClubs || '0', 10) || 0) * 50000).toLocaleString()}원`} 
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              재등록은 기존 교회의 클럽 수에 따라 클럽당 50,000원씩 영수증이 발급됩니다.
            </Alert>
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCreateRenewReceipt} 
              disabled={loading || !selectedYear || !renewChurch || !renewClubs}
              size="large"
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : '재등록 처리'}
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

export default RenewChurchRegistrationPage;
