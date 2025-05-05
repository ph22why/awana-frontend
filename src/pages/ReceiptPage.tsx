import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { receiptApi, Receipt } from '../services/api/receiptApi';
import { eventApi } from '../services/api/eventApi';
import type { IEvent } from '../services/api/eventApi';
import { churchApi, Church } from '../services/api/churchApi';

const ReceiptPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNoChurchMessage, setShowNoChurchMessage] = useState<boolean>(false);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [receiptYears, setReceiptYears] = useState<string[]>([]);
  const [filteredReceiptEvents, setFilteredReceiptEvents] = useState<IEvent[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [receiptLoading, setReceiptLoading] = useState<boolean>(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // 이벤트 목록 불러오기 (DB에서)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const dbEvents = await eventApi.getEvents();
        setEvents(dbEvents);
      } catch (err) {
        setError('이벤트 목록을 불러오는데 실패했습니다.');
        console.error('Error fetching events:', err);
      }
    };
    fetchEvents();
  }, []);

  // 년도별 이벤트 필터링 (DB 이벤트 기준)
  const availableYears = Array.from(
    new Set(events.map(event => event.event_Year))
  ).sort((a, b) => b - a);
  const filteredEvents = events.filter(event => 
    event.event_Year.toString() === selectedYear
  );

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 전화번호 입력 핸들러
  const handlePhoneNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (formatted.length <= 13) {
      setPhoneNumber(formatted);
      setShowNoChurchMessage(formatted.length === 13);
    }
  };

  // 등록번호 입력 핸들러
  const handleRegistrationNumber = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    if (value.length <= 4) {
      setRegistrationNumber(value);
      if (value.length >= 3) {
        setHasSearched(true);
        setIsLoading(true);
        try {
          // 실제 API 호출로 mainId(등록번호)로 교회 조회 (전체 받아서 includes로 필터)
          const res = await churchApi.searchChurches({ getAllResults: true });
          const churches = (res.data || []).filter(church => church.mainId.includes(value));
          // subId 종류별로 그룹화
          const subIdMap: { [subId: string]: Church[] } = {};
          churches.forEach(church => {
            if (!subIdMap[church.subId]) subIdMap[church.subId] = [];
            subIdMap[church.subId].push(church);
          });
          const subIds = Object.keys(subIdMap);
          if (subIds.length === 1) {
            // subId가 1개면 해당 교회만 선택
            setChurches(subIdMap[subIds[0]]);
            setSelectedChurch(subIdMap[subIds[0]][0]._id);
          } else if (subIds.length > 1) {
            // subId가 여러개면 교회명 리스트로 표시
            setChurches(churches);
            setSelectedChurch('');
          } else {
            setChurches([]);
            setSelectedChurch('');
          }
        } catch (err) {
          console.error('Error fetching church by regId:', err);
          setChurches([]);
          setSelectedChurch('');
        } finally {
          setIsLoading(false);
        }
      } else {
        setHasSearched(false);
        setChurches([]);
        setSelectedChurch('');
      }
    }
  };

  // Fetch all receipts on mount
  useEffect(() => {
    const fetchReceipts = async () => {
      setReceiptLoading(true);
      try {
        const response = await receiptApi.getReceipts();
        const allReceipts = Array.isArray(response) ? response : response.data;
        setReceipts(allReceipts);
        // Extract unique years from receipts
        const years = Array.from(new Set(allReceipts.map(r => new Date(r.paymentDate || r.createdAt).getFullYear().toString()))).sort((a, b) => b.localeCompare(a));
        setReceiptYears(years);
      } catch (err) {
        setReceiptError('영수증 데이터를 불러오는데 실패했습니다.');
      } finally {
        setReceiptLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  // Filter events by selected year (from receipts)
  useEffect(() => {
    if (!selectedYear) {
      setFilteredReceiptEvents([]);
      return;
    }
    // Find event IDs from receipts for the selected year
    const yearReceipts = receipts.filter(r => new Date(r.paymentDate || r.createdAt).getFullYear().toString() === selectedYear);
    const eventIds = Array.from(new Set(yearReceipts.map(r => r.eventId)));
    // Map to IEvent objects if possible (fallback to eventId string)
    const eventsForYear = events.filter(e => eventIds.includes(e._id));
    setFilteredReceiptEvents(eventsForYear);
  }, [selectedYear, receipts, events]);

  // Filter receipts by selected year, event, registration number, and phone number
  useEffect(() => {
    let filtered = receipts;
    if (selectedYear) {
      filtered = filtered.filter(r => new Date(r.paymentDate || r.createdAt).getFullYear().toString() === selectedYear);
    }
    if (selectedEvent) {
      filtered = filtered.filter(r => r.eventId === selectedEvent);
    }
    if (registrationNumber.length === 4) {
      filtered = filtered.filter(r => r.churchId.mainId.endsWith(registrationNumber));
    }
    // 교회가 선택된 경우 해당 교회만 필터링
    if (selectedChurch) {
      const selected = churches.find(c => c._id === selectedChurch);
      if (selected) {
        filtered = filtered.filter(r => r.churchId && r.churchId.mainId === selected.mainId && r.churchId.subId === selected.subId);
      }
    }
    // 전화번호 필터는 교회까지 필터된 후 적용
    if (phoneNumber.replace(/-/g, '').length >= 10) {
      filtered = filtered.filter(r => r.managerPhone.replace(/-/g, '').includes(phoneNumber.replace(/-/g, '')));
    }
    setFilteredReceipts(filtered);
  }, [selectedYear, selectedEvent, registrationNumber, phoneNumber, receipts, selectedChurch, churches]);

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          영수증 발급
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <form>
          <Grid container spacing={3}>
            {/* 년도와 이벤트 선택 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>년도 선택</InputLabel>
                <Select
                  value={selectedYear}
                  label="년도 선택"
                  onChange={(e: SelectChangeEvent) => setSelectedYear(e.target.value)}
                >
                  {availableYears.map((year) => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}년
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>이벤트 선택</InputLabel>
                <Select
                  value={selectedEvent}
                  label="이벤트 선택"
                  onChange={(e: SelectChangeEvent) => setSelectedEvent(e.target.value)}
                  disabled={!selectedYear}
                >
                  {filteredEvents.map((event) => (
                    <MenuItem key={event._id} value={event._id}>
                      {event.event_Name} ({event.event_Place})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 등록번호와 전화번호 입력 */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="등록번호"
                value={registrationNumber}
                onChange={handleRegistrationNumber}
                placeholder="3자리 이상 입력"
                inputProps={{ maxLength: 4 }}
                helperText="교회 등록번호 4자리"
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="전화번호"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="010-0000-0000"
                helperText="교회에 등록된 전화번호"
              />
            </Grid>

            {/* 교회 선택 */}
            <Grid item xs={12}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              ) : churches.length > 0 ? (
                <FormControl fullWidth>
                  <InputLabel>교회 선택</InputLabel>
                  <Select
                    value={selectedChurch}
                    label="교회 선택"
                    onChange={(e: SelectChangeEvent) => setSelectedChurch(e.target.value)}
                  >
                    {churches.map((church) => (
                      <MenuItem key={church._id} value={church._id}>
                        {church.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : showNoChurchMessage && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  해당 정보로 등록된 교회를 찾을 수 없습니다.
                </Alert>
              )}
            </Grid>

            {/* 버튼 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  size="large"
                >
                  뒤로
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Display filtered receipts only after search */}
      {hasSearched && (
        filteredReceipts.length > 0 && selectedChurch ? (
          <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>조회된 영수증</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>담당자</th>
                    <th>전화번호</th>
                    <th>금액</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map(r => (
                    <tr key={r._id}>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{r.managerName}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{r.managerPhone}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{r.costs.toLocaleString()}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          style={{
                            minWidth: 100,
                            padding: '8px 0',
                            margin: 0,
                            verticalAlign: 'middle',
                            display: 'inline-block',
                          }}
                          onClick={() => {
                            setSelectedReceipt(r);
                            setReceiptDialogOpen(true);
                          }}
                        >
                          저장하기
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        ) : (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Alert severity="info">조회된 영수증이 없습니다.</Alert>
          </Box>
        )
      )}

      <Dialog open={receiptDialogOpen} onClose={() => setReceiptDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: 24, letterSpacing: 2, borderBottom: 'none', p: 0, pt: 3, color: '#111' }}>영 수 증 (RECEIPT)</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #print-receipt, #print-receipt * { visibility: visible !important; color: #111 !important; }
              #print-receipt {
                position: relative !important;
                left: 0 !important;
                right: 0 !important;
                margin: 0 auto !important;
                width: 620px !important;
                max-width: 620px !important;
                min-width: 0 !important;
                background: white;
                z-index: 9999;
                box-shadow: none !important;
                box-sizing: border-box !important;
                padding: 5px !important;
                border: 3px solid #222 !important;
                page-break-inside: avoid;
                overflow: hidden !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm;
                orientation: portrait;
              }
            }
          `}</style>
          {selectedReceipt && (
            <div id="print-receipt" style={{
              width: 700,
              margin: '0 auto',
              border: '3px solid #222',
              padding: 0,
              background: '#fff',
              fontFamily: 'inherit',
              position: 'relative',
              color: '#111',
            }}>
              <div style={{ padding: 32, paddingBottom: 16 }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 28, letterSpacing: 2, marginBottom: 16, color: '#111' }}>영 수 증 (RECEIPT)</div>
                <div style={{ fontSize: 16, color: '#111', marginBottom: 8, padding: '0 32px' }}>
                  {/* No. + 영수증ID, 사업자등록번호 한 줄 */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 16 }}>
                    <span style={{ minWidth: 80, fontWeight: 500, flexShrink: 0, fontSize: 16 }}>No. {selectedReceipt._id}</span>
                    <span style={{ minWidth: 120, fontWeight: 500, flexShrink: 0, fontSize: 16, marginLeft: 32 }}>사업자등록번호 {'129-82-73149'}</span>
                  </div>
                  {/* 영수지정인 */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 32 }}>
                    <span style={{ minWidth: 220, fontWeight: 500, flexShrink: 0, fontSize: 16 }}>• 영수지정인 (Received of)</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ display: 'inline-block', minWidth: 350 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 400, fontSize: 17, color: '#111', lineHeight: '38px', paddingLeft: 4 }}>{selectedReceipt.churchName}</span>
                          <div style={{ borderBottom: '1.5px solid #222', width: '50%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 내역 */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 32 }}>
                    <span style={{ minWidth: 220, fontWeight: 500, flexShrink: 0, fontSize: 16 }}>• 내역 (Description)</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ display: 'inline-block', minWidth: 350 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 400, fontSize: 17, color: '#111', lineHeight: '38px', paddingLeft: 4 }}>{events.find(e => e._id === selectedReceipt.eventId)?.event_Name || ''}</span>
                          <div style={{ borderBottom: '1.5px solid #222', width: '50%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 금액 */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 32 }}>
                    <span style={{ minWidth: 220, fontWeight: 500, flexShrink: 0, fontSize: 16 }}>금액 (Amount)</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ display: 'inline-block', minWidth: 180 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 400, fontSize: 17, color: '#111', lineHeight: '38px', paddingLeft: 4 }}>{selectedReceipt.costs.toLocaleString()}<span style={{ marginLeft: 16 }}>원(₩)</span></span>
                          <div style={{ borderBottom: '1.5px solid #222', width: '50%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, color: '#111', margin: '28px 0 28px 0', textAlign: 'left', fontWeight: 400 }}>
                    상기 금액을 영수합니다.
                  </div>
                  {/* 날짜만 한 줄로 (담당자 제거) */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 32 }}>
                    <span style={{ minWidth: 140, fontWeight: 500, flexShrink: 0, fontSize: 16 }}>날짜 (Date)</span>
                    <div style={{ flex: 1, maxWidth: 220, display: 'flex', alignItems: 'flex-end', marginRight: 32 }}>
                      <div style={{ display: 'inline-block', minWidth: 120, maxWidth: 220 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 400, fontSize: 17, color: '#111', lineHeight: '38px', paddingLeft: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString() : ''}</span>
                          <div style={{ borderBottom: '1.5px solid #222', width: '50%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                    <span style={{ minWidth: 100, fontWeight: 500, flexShrink: 0, fontSize: 16, marginLeft: 32 }}>담당 (by)</span>
                    <div style={{ flex: 1, maxWidth: 220, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ display: 'inline-block', minWidth: 120, maxWidth: 220 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 400, fontSize: 17, color: '#111', lineHeight: '38px', paddingLeft: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><img src="/sign.png" alt="sign" style={{ height: 50, marginLeft: 0, marginBottom: -20, display: 'inline-block', verticalAlign: 'middle' }} /></span>
                          <div style={{ borderBottom: '1.5px solid #222', width: '80%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 하단 로고/도장 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, position: 'relative' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: 10, color: '#111', display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.png" alt="logo" style={{ height: 20, marginRight: 100, verticalAlign: 'middle' }} />
                    AWANA KOREA
                    {/* 도장: 오른쪽 끝에 겹치게 */}
                    <img src="/stamp.png" alt="stamp" style={{ height: 60, opacity: 0.8, marginLeft: 400, position: 'absolute', bottom: -10, zIndex: 2 }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="outlined" onClick={() => setReceiptDialogOpen(false)}>닫기</Button>
          <Button variant="contained" color="primary" onClick={() => window.print()}>인쇄</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReceiptPage; 