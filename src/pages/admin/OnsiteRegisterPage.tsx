import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Container, Typography, Paper, TextField, Button, MenuItem, FormControl, InputLabel, Select, Grid, Alert, Snackbar, Box
} from '@mui/material';
import { eventApi, IEvent } from '../../services/api/eventApi';
import { receiptApi } from '../../services/api/receiptApi';
import moment from 'moment';
import type { Receipt } from '../../services/api/receiptApi';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import { churchApi, Church } from '../../services/api/churchApi';

interface EventOption {
  id: string;
  name: string;
  place: string;
}

const OnsiteRegisterPage: React.FC = () => {
  const { role } = useOutletContext<{ role: string }>();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [form, setForm] = useState({
    mainId: '',
    subId: '',
    churchName: '',
    managerName: '',
    managerPhone: '',
    partTotal: '',
    partStudent: '',
    partTeacher: '',
    partYM: '',
    costs: '',
  });
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<Receipt | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [churchInput, setChurchInput] = useState('');
  const [location, setLocation] = useState('');
  const [churchLoading, setChurchLoading] = useState(false);

  // 전화번호 자동 포맷 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  useEffect(() => {
    if (role !== 'mini' && role !== 'admin') {
      setError('접근 권한이 없습니다.');
      return;
    }
    // 공개 + 기간 중인 이벤트만 필터링
    const fetchEvents = async () => {
      try {
        const allEvents = await eventApi.getEvents();
        const now = moment();
        const filtered = allEvents.filter(ev =>
          ev.event_Open_Available === '공개' &&
          now.isSameOrAfter(moment(ev.event_Start_Date)) &&
          now.isBefore(moment(ev.event_End_Date).add(1, 'days').startOf('day'))
        );
        setEvents(filtered.map(ev => ({ id: ev._id, name: ev.event_Name, place: ev.event_Place })));
      } catch {
        setError('이벤트 목록을 불러오지 못했습니다.');
      }
    };
    fetchEvents();
  }, [role]);

  useEffect(() => {
    if (!selectedEvent) {
      setReceipts([]);
      return;
    }
    setLoadingReceipts(true);
    receiptApi.getReceipts({ eventId: selectedEvent })
      .then(res => setReceipts(res.data))
      .catch(() => setReceipts([]))
      .finally(() => setLoadingReceipts(false));
  }, [selectedEvent, snackbar.open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !form.mainId || !form.churchName || !form.managerName || !form.managerPhone || !form.partTotal || !form.costs) {
      setSnackbar({ open: true, message: '필수 정보를 모두 입력해주세요.', severity: 'error' });
      return;
    }
    try {
      if (editMode && editTarget) {
        await receiptApi.updateReceipt(editTarget._id || editTarget.id, {
          eventId: selectedEvent,
          churchId: { mainId: form.mainId, subId: form.subId },
          churchName: form.churchName,
          managerName: form.managerName,
          managerPhone: form.managerPhone,
          partTotal: parseInt(form.partTotal) || 0,
          partStudent: parseInt(form.partStudent) || 0,
          partTeacher: parseInt(form.partTeacher) || 0,
          partYM: parseInt(form.partYM) || 0,
          costs: parseInt(form.costs) || 0,
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          paymentDate: new Date().toISOString(),
          description: '',
        });
        setSnackbar({ open: true, message: '수정 완료!', severity: 'success' });
      } else {
        await receiptApi.createReceipt({
          eventId: selectedEvent,
          churchId: { mainId: form.mainId, subId: form.subId },
          churchName: form.churchName,
          managerName: form.managerName,
          managerPhone: form.managerPhone,
          partTotal: parseInt(form.partTotal) || 0,
          partStudent: parseInt(form.partStudent) || 0,
          partTeacher: parseInt(form.partTeacher) || 0,
          partYM: parseInt(form.partYM) || 0,
          costs: parseInt(form.costs) || 0,
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          paymentDate: new Date().toISOString(),
          description: '',
        });
        setSnackbar({ open: true, message: '등록 완료!', severity: 'success' });
      }
      setForm({ mainId: '', subId: '', churchName: '', managerName: '', managerPhone: '', partTotal: '', partStudent: '', partTeacher: '', partYM: '', costs: '' });
      setEditMode(false);
      setEditTarget(null);
      setError('');
    } catch {
      setSnackbar({ open: true, message: editMode ? '수정에 실패했습니다.' : '등록에 실패했습니다.', severity: 'error' });
    }
  };

  const handleEdit = (receipt: Receipt) => {
    setForm({
      mainId: receipt.churchId.mainId,
      subId: receipt.churchId.subId || '',
      churchName: receipt.churchName,
      managerName: receipt.managerName,
      managerPhone: receipt.managerPhone,
      partTotal: receipt.partTotal.toString(),
      partStudent: receipt.partStudent?.toString() || '',
      partTeacher: receipt.partTeacher?.toString() || '',
      partYM: receipt.partYM?.toString() || '',
      costs: receipt.costs.toString(),
    });
    setEditMode(true);
    setEditTarget(receipt);
  };

  const handleCancelEdit = () => {
    setForm({ mainId: '', subId: '', churchName: '', managerName: '', managerPhone: '', partTotal: '', partStudent: '', partTeacher: '', partYM: '', costs: '' });
    setEditMode(false);
    setEditTarget(null);
  };

  // 교회 검색
  const handleChurchSearch = async (value: string) => {
    if (!value || value.length < 2) {
      setChurches([]);
      return;
    }
    setChurchLoading(true);
    try {
      const isMainId = /^\d{4}$/.test(value);
      let searchParams = {};
      if (isMainId) {
        searchParams = { mainId: value };
      } else {
        searchParams = { name: value };
      }
      const response = await churchApi.searchChurches({ ...searchParams, getAllResults: true });
      if (response.success) {
        setChurches(response.data);
      }
    } catch {
      setChurches([]);
    } finally {
      setChurchLoading(false);
    }
  };

  // 교회 선택 시 폼 자동 채움
  const handleChurchSelect = (church: Church | null) => {
    setSelectedChurch(church);
    if (church) {
      setForm(prev => ({
        ...prev,
        mainId: church.mainId,
        subId: church.subId,
        churchName: church.name,
        managerName: church.managerName || '',
        managerPhone: church.phone || '',
      }));
      setLocation(church.location || '');
    }
  };

  // churchInput 변경 시 검색
  useEffect(() => {
    handleChurchSearch(churchInput);
  }, [churchInput]);

  if (!(role === 'mini' || role === 'admin')) return <Container><Alert severity="error">접근 권한이 없습니다.</Alert></Container>;

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>현장등록</Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }} required>
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                value={selectedChurch}
                onChange={(_, newValue) => {
                  if (typeof newValue === 'string') return;
                  handleChurchSelect(newValue);
                }}
                onInputChange={(_, newValue) => setChurchInput(newValue)}
                options={churches}
                getOptionLabel={option => typeof option === 'string' ? option : `${option.name} (${option.mainId})`}
                isOptionEqualToValue={(option, value) => option.mainId === value.mainId && option.subId === value.subId}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography>{option.name} <Typography component="span" color="textSecondary">({option.mainId})</Typography></Typography>
                  </li>
                )}
                renderInput={params => (
                  <TextField {...params} label="교회명 또는 등록번호 검색" fullWidth required helperText="교회명이나 4자리 등록번호를 입력하세요" />
                )}
                loading={churchLoading}
                loadingText="검색중..."
                noOptionsText="검색 결과가 없습니다"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="등록번호(메인)" name="mainId" value={form.mainId} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="등록번호(서브)" name="subId" value={form.subId} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="교회명" name="churchName" value={form.churchName} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="주소" name="location" value={location} onChange={e => setLocation(e.target.value)} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="담당자명" name="managerName" value={form.managerName} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="담당자 연락처"
                name="managerPhone"
                value={form.managerPhone}
                onChange={e => {
                  const formatted = formatPhoneNumber(e.target.value);
                  if (formatted.length <= 13) {
                    setForm(prev => ({ ...prev, managerPhone: formatted }));
                  }
                }}
                required
                placeholder="010-0000-0000"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="전체 인원" name="partTotal" value={form.partTotal} onChange={handleChange} required type="number" />
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField fullWidth label="학생 수" name="partStudent" value={form.partStudent} onChange={handleChange} type="number" />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth label="선생 수" name="partTeacher" value={form.partTeacher} onChange={handleChange} type="number" />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth label="YM 수" name="partYM" value={form.partYM} onChange={handleChange} type="number" />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="금액" name="costs" value={form.costs} onChange={handleChange} required type="number" InputProps={{ endAdornment: <Typography>원</Typography> }} />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>{editMode ? '수정' : '등록'}</Button>
          {editMode && (
            <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 1 }} onClick={handleCancelEdit}>취소</Button>
          )}
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        {selectedEvent && (
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>현장등록 내역</Typography>
            {loadingReceipts ? (
              <Typography>로딩 중...</Typography>
            ) : receipts.length === 0 ? (
              <Typography>등록된 내역이 없습니다.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>교회명</th>
                      <th>등록번호</th>
                      <th>담당자</th>
                      <th>연락처</th>
                      <th>전체</th>
                      <th>학생</th>
                      <th>선생</th>
                      <th>YM</th>
                      <th>금액</th>
                      <th>등록일</th>
                      <th>수정</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map(r => (
                      <tr key={r._id || r.id}>
                        <td>{r.churchName}</td>
                        <td>{r.churchId.mainId}{r.churchId.subId && `-${r.churchId.subId}`}</td>
                        <td>{r.managerName}</td>
                        <td>{r.managerPhone}</td>
                        <td>{r.partTotal}</td>
                        <td>{r.partStudent}</td>
                        <td>{r.partTeacher}</td>
                        <td>{r.partYM}</td>
                        <td>{r.costs.toLocaleString()}원</td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          <IconButton size="small" onClick={() => handleEdit(r)} title="수정">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default OnsiteRegisterPage; 