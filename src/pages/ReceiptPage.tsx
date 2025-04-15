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
} from '@mui/material';

interface Church {
  church_reg_ID: string;
  church_Name: string;
  church_Phone?: string;
}

interface Event {
  event_ID: number;
  event_Name: string;
  event_Year: number;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 이벤트 목록 불러오기
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // TODO: Replace with actual API call
        const mockEvents = [
          { event_ID: 1, event_Name: '2024 AWANA 리더십 컨퍼런스', event_Year: 2024 },
          { event_ID: 2, event_Name: 'AWANA 올림피아드', event_Year: 2024 },
          { event_ID: 3, event_Name: 'AWANA 겨울 캠프', event_Year: 2024 },
        ];
        setEvents(mockEvents);
      } catch (err) {
        setError('이벤트 목록을 불러오는데 실패했습니다.');
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  // 년도별 이벤트 필터링
  const filteredEvents = events.filter(event => 
    event.event_Year.toString() === selectedYear
  );

  // 사용 가능한 년도 목록 생성
  const availableYears = Array.from(
    new Set(events.map(event => event.event_Year))
  ).sort((a, b) => b - a);

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
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement receipt issuance logic
    console.log('Receipt issuance requested:', {
      year: selectedYear,
      event: selectedEvent,
      church: selectedChurch,
      registrationNumber,
      phoneNumber,
    });
  };

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
        <form onSubmit={handleSubmit}>
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
                    <MenuItem key={event.event_ID} value={event.event_ID.toString()}>
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
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!selectedEvent || !selectedChurch}
                >
                  영수증 발급하기
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ReceiptPage; 