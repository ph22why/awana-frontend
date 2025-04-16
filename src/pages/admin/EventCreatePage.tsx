import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Container,
  Paper,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { eventApi } from '../../services/api/eventApi';
import type { Moment } from 'moment';
import moment from 'moment';
import type { EventFormData, SampleEvent } from '../../types/event';

const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<EventFormData>>({
    event_Open_Available: '비공개'
  });
  const [sampleEvents, setSampleEvents] = useState<SampleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSampleEvents();
  }, []);

  const fetchSampleEvents = async () => {
    try {
      console.log('Fetching sample events...');
      const response = await eventApi.getSampleEvents();
      console.log('Sample events response:', response);
      if (response.success) {
        setSampleEvents(response.data);
      } else {
        throw new Error('샘플 이벤트 목록을 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Error fetching sample events:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      setSnackbar({
        open: true,
        message: `이벤트 목록을 불러오는 중 오류가 발생했습니다: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const handleEventNameSelect = (event: SelectChangeEvent<string>) => {
    const eventId = parseInt(event.target.value, 10);
    const selectedEvent = sampleEvents.find(event => event.sampleEvent_ID === eventId);
    if (selectedEvent) {
      const currentYear = new Date().getFullYear();
      setFormData(prev => ({
        ...prev,
        event_Name: `${selectedEvent.sampleEvent_Name} ${currentYear}`,
        event_Place: selectedEvent.sampleEvent_Place || '미정',
        event_Location: selectedEvent.sampleEvent_Location || '미정',
        event_Open_Available: selectedEvent.sampleEvent_Open_Available as '공개' | '비공개',
        event_Month: parseInt(selectedEvent.sampleEvent_Month) || new Date().getMonth() + 1,
        event_Year: currentYear
      }));
    }
  };

  const handleDateChange = (
    date: Moment | null,
    field: 'event_Start_Date' | 'event_End_Date' | 'event_Registration_Start_Date' | 'event_Registration_End_Date'
  ) => {
    if (date) {
      if (field === 'event_Start_Date') {
        setFormData(prev => ({
          ...prev,
          [field]: date.format('YYYY-MM-DD'),
          event_Year: date.year(),
          event_Month: date.month() + 1
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: date.format('YYYY-MM-DD')
        }));
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      await eventApi.createEvent(formData as EventFormData);
      setSnackbar({
        open: true,
        message: '이벤트가 성공적으로 생성되었습니다.',
        severity: 'success'
      });
      navigate('/admin');
    } catch (error) {
      console.error('Error creating event:', error);
      setSnackbar({
        open: true,
        message: '이벤트 생성에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            이벤트 생성
          </Typography>
          <Button onClick={() => navigate('/admin')} variant="outlined">
            뒤로 가기
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>이벤트명</InputLabel>
                <Select
                  value={sampleEvents.find(event => 
                    `${event.sampleEvent_Name} ${new Date().getFullYear()}` === formData.event_Name
                  )?.sampleEvent_ID.toString() || ''}
                  onChange={handleEventNameSelect}
                  label="이벤트명"
                  required
                >
                  {sampleEvents.map(event => (
                    <MenuItem
                      key={`event-${event.sampleEvent_ID}`}
                      value={event.sampleEvent_ID.toString()}
                    >
                      {`${event.sampleEvent_Name} ${new Date().getFullYear()}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="년도"
                name="event_Year"
                value={formData.event_Year || ''}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="월"
                name="event_Month"
                value={formData.event_Month || ''}
                disabled
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="장소"
                name="event_Place"
                value={formData.event_Place || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="상세 위치"
                name="event_Location"
                value={formData.event_Location || ''}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="이벤트 시작일"
                  value={formData.event_Start_Date ? moment(formData.event_Start_Date) : null}
                  onChange={(date) => handleDateChange(date, 'event_Start_Date')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="이벤트 종료일"
                  value={formData.event_End_Date ? moment(formData.event_End_Date) : null}
                  onChange={(date) => handleDateChange(date, 'event_End_Date')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="등록 시작일"
                  value={formData.event_Registration_Start_Date ? moment(formData.event_Registration_Start_Date) : null}
                  onChange={(date) => handleDateChange(date, 'event_Registration_Start_Date')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="등록 종료일"
                  value={formData.event_Registration_End_Date ? moment(formData.event_Registration_End_Date) : null}
                  onChange={(date) => handleDateChange(date, 'event_Registration_End_Date')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>공개 여부</InputLabel>
                <Select
                  value={formData.event_Open_Available || '비공개'}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_Open_Available: e.target.value as '공개' | '비공개' }))}
                  label="공개 여부"
                >
                  <MenuItem value="공개">공개</MenuItem>
                  <MenuItem value="비공개">비공개</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                이벤트 생성
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventCreatePage; 