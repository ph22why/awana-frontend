import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { eventApi } from '../../services/api/eventApi';
import type { Moment } from 'moment';
import moment from 'moment';
import type { EventFormData } from '../../types/event';

const EventEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<EventFormData>({
    event_Name: '',
    event_Place: '',
    event_Location: '',
    event_Year: new Date().getFullYear(),
    event_Month: new Date().getMonth() + 1,
    event_Start_Date: moment().format('YYYY-MM-DD'),
    event_End_Date: moment().format('YYYY-MM-DD'),
    event_Registration_Start_Date: moment().format('YYYY-MM-DD'),
    event_Registration_End_Date: moment().format('YYYY-MM-DD'),
    event_Open_Available: '공개'
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!id) return;
        const events = await eventApi.getEvents();
        const event = events.find(event => event._id === id);
        if (event) {
          setFormData({
            event_Name: event.event_Name,
            event_Place: event.event_Place,
            event_Location: event.event_Location,
            event_Year: event.event_Year,
            event_Month: event.event_Month,
            event_Start_Date: moment(event.event_Start_Date).format('YYYY-MM-DD'),
            event_End_Date: moment(event.event_End_Date).format('YYYY-MM-DD'),
            event_Registration_Start_Date: moment(event.event_Registration_Start_Date).format('YYYY-MM-DD'),
            event_Registration_End_Date: moment(event.event_Registration_End_Date).format('YYYY-MM-DD'),
            event_Open_Available: event.event_Open_Available
          });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        // Handle error appropriately
      }
    };

    fetchEvent();
  }, [id]);

  const handleDateChange = (field: keyof EventFormData) => (date: Moment | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date.format('YYYY-MM-DD'),
        ...(field === 'event_Start_Date' ? {
          event_Year: date.year(),
          event_Month: date.month() + 1
        } : {})
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) return;
      await eventApi.updateEvent(id, formData);
      navigate('/admin/events');
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            이벤트 수정
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="이벤트 이름"
                name="event_Name"
                value={formData.event_Name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="장소"
                name="event_Place"
                value={formData.event_Place}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="위치"
                name="event_Location"
                value={formData.event_Location}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="년도"
                name="event_Year"
                value={formData.event_Year}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="월"
                name="event_Month"
                value={formData.event_Month}
                onChange={handleInputChange}
                required
                inputProps={{ min: 1, max: 12 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="시작일"
                  value={moment(formData.event_Start_Date)}
                  onChange={handleDateChange('event_Start_Date')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="종료일"
                  value={moment(formData.event_End_Date)}
                  onChange={handleDateChange('event_End_Date')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="등록 시작일"
                  value={moment(formData.event_Registration_Start_Date)}
                  onChange={handleDateChange('event_Registration_Start_Date')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="등록 종료일"
                  value={moment(formData.event_Registration_End_Date)}
                  onChange={handleDateChange('event_Registration_End_Date')}
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
                  name="event_Open_Available"
                  value={formData.event_Open_Available}
                  onChange={handleSelectChange}
                  label="공개 여부"
                >
                  <MenuItem value="공개">공개</MenuItem>
                  <MenuItem value="비공개">비공개</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/events')}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  수정
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EventEditPage; 