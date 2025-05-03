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

interface Church {
  church_reg_ID: string;
  church_Name: string;
  church_Phone?: string;
}

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
      
      if (formatted.length === 13) {
        setIsLoading(true);
        try {
          // TODO: Replace with actual API call
          const mockChurches = [
            { church_reg_ID: '0001', church_Name: '서울중앙교회', church_Phone: '01012345678' },
            { church_reg_ID: '0002', church_Name: '부산성도교회', church_Phone: '01087654321' },
          ];
          const filteredChurches = mockChurches.filter(church => 
            church.church_Phone?.includes(formatted.replace(/-/g, ''))
          );
          setChurches(filteredChurches);
        } catch (err) {
          console.error('Error fetching church by phone:', err);
          setChurches([]);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // 등록번호 입력 핸들러
  const handleRegistrationNumber = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    if (value.length <= 4) {
      setRegistrationNumber(value);
      if (value.length === 4) {
        setHasSearched(true);
        setIsLoading(true);
        try {
          // TODO: Replace with actual API call
          const mockChurches = [
            { church_reg_ID: '0001', church_Name: '서울중앙교회', church_Phone: '01012345678' },
            { church_reg_ID: '0002', church_Name: '부산성도교회', church_Phone: '01087654321' },
          ];
          const filteredChurches = mockChurches.filter(church => 
            church.church_reg_ID?.includes(value)
          );
          setChurches(filteredChurches);
        } catch (err) {
          console.error('Error fetching church by regId:', err);
          setChurches([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setHasSearched(false);
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
    if (phoneNumber.replace(/-/g, '').length >= 10) {
      filtered = filtered.filter(r => r.managerPhone.replace(/-/g, '').includes(phoneNumber.replace(/-/g, '')));
    }
    setFilteredReceipts(filtered);
  }, [selectedYear, selectedEvent, registrationNumber, phoneNumber, receipts]);

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
                      {event.event_Name}
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
                placeholder="4자리 입력"
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
                      <MenuItem key={church.church_reg_ID} value={church.church_reg_ID}>
                        {church.church_Name}
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
      {hasSearched && filteredReceipts.length > 0 && (
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
                  {/* No. */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 32 }}>
                    <span style={{ minWidth: 220, fontWeight: 500, flexShrink: 0, fontSize: 16 }}>No.</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ display: 'inline-block', minWidth: 350 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 400, fontSize: 17, color: '#111', lineHeight: '38px', paddingLeft: 4 }}>{'129-82-73149'}</span>
                          <div style={{ borderBottom: '1.5px solid #222', width: '100%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 영수지정인 */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 32 }}>
                    <span style={{ minWidth: 220, fontWeight: 500, flexShrink: 0, fontSize: 16 }}>• 영수지정인 (Received of)</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ display: 'inline-block', minWidth: 350 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 400, fontSize: 17, color: '#111', lineHeight: '38px', paddingLeft: 4 }}>{selectedReceipt.churchName}</span>
                          <div style={{ borderBottom: '1.5px solid #222', width: '100%', marginTop: 4 }} />
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
                          <div style={{ borderBottom: '1.5px solid #222', width: '100%', marginTop: 4 }} />
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
                          <div style={{ borderBottom: '1.5px solid #222', width: '100%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, color: '#111', margin: '28px 0 28px 0', textAlign: 'left', fontWeight: 400 }}>
                    상기 금액을 영수 / 청구 합니다.
                  </div>
                  {/* 날짜, 담당자 한 줄 */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 32 }}>
                    <span style={{ minWidth: 140, fontWeight: 500, flexShrink: 0, fontSize: 16 }}>날짜 (Date)</span>
                    <div style={{ flex: 1, maxWidth: 220, display: 'flex', alignItems: 'flex-end', marginRight: 32 }}>
                      <div style={{ display: 'inline-block', minWidth: 120, maxWidth: 220 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 400, fontSize: 17, color: '#111', lineHeight: '38px', paddingLeft: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedReceipt.paymentDate ? new Date(selectedReceipt.paymentDate).toLocaleDateString() : ''}</span>
                          <div style={{ borderBottom: '1.5px solid #222', width: '100%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                    <span style={{ minWidth: 100, fontWeight: 500, flexShrink: 0, fontSize: 16, marginLeft: 32 }}>담당 (by)</span>
                    <div style={{ flex: 1, maxWidth: 220, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ display: 'inline-block', minWidth: 120, maxWidth: 220 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 400, fontSize: 17, color: '#111', lineHeight: '38px', paddingLeft: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedReceipt.managerName}<img src="/sign.png" alt="sign" style={{ height: 32, marginLeft: 8, marginBottom: -8, display: 'inline-block', verticalAlign: 'middle' }} /></span>
                          <div style={{ borderBottom: '1.5px solid #222', width: '100%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: 10, color: '#111' }}>
                    <img src="/logo.png" alt="logo" style={{ height: 32, marginRight: 8, verticalAlign: 'middle' }} />
                  AWANA KOREA
                  </div>
                  <img src="/stamp.png" alt="stamp" style={{ height: 60, opacity: 0.8, marginLeft: 8 }} />
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