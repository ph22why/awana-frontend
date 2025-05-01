import React, { useState, useEffect } from 'react';
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
  Autocomplete,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';

interface Church {
  church_reg_ID: string;
  church_Name: string;
}

interface Event {
  event_ID: number;
  event_Name: string;
  event_Year: number;
}

interface Receipt {
  id: string;
  eventId: number;
  churchRegId: string;
  churchName: string;
  costs: number;
  createdAt: Date;
}

const EventReceiptManagePage: React.FC = () => {
  // State for year and event selection
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);

  // State for church search and selection
  const [churchRegId, setChurchRegId] = useState<string>('');
  const [churchName, setChurchName] = useState<string>('');
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);

  // State for receipt form
  const [costs, setcosts] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for receipts list
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  // Load events on component mount
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
      }
    };

    fetchEvents();
  }, []);

  // Filter events by selected year
  const filteredEvents = events.filter(event => 
    event.event_Year.toString() === selectedYear
  );

  // Get available years from events
  const availableYears = Array.from(
    new Set(events.map(event => event.event_Year))
  ).sort((a, b) => b - a);

  // Handle church registration number input
  const handleChurchRegIdChange = async (value: string) => {
    if (value.length <= 4) {
      setChurchRegId(value);
      if (value.length === 4) {
        setIsLoading(true);
        try {
          // TODO: Replace with actual API call
          const mockChurches = [
            { church_reg_ID: '0001', church_Name: '서울중앙교회' },
            { church_reg_ID: '0002', church_Name: '부산성도교회' },
          ];
          const filteredChurches = mockChurches.filter(church => 
            church.church_reg_ID.includes(value)
          );
          setChurches(filteredChurches);
          if (filteredChurches.length === 1) {
            setSelectedChurch(filteredChurches[0]);
            setChurchName(filteredChurches[0].church_Name);
          }
        } catch (err) {
          setError('교회 정보를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // Handle church name input
  const handleChurchNameChange = async (value: string) => {
    setChurchName(value);
    if (value.length >= 2) {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockChurches = [
          { church_reg_ID: '0001', church_Name: '서울중앙교회' },
          { church_reg_ID: '0002', church_Name: '부산성도교회' },
        ];
        const filteredChurches = mockChurches.filter(church => 
          church.church_Name.includes(value)
        );
        setChurches(filteredChurches);
      } catch (err) {
        setError('교회 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedChurch || !costs) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const newReceipt: Receipt = {
        id: Math.random().toString(36).substr(2, 9),
        eventId: parseInt(selectedEvent),
        churchRegId: selectedChurch.church_reg_ID,
        churchName: selectedChurch.church_Name,
        costs: parseFloat(costs),
        createdAt: new Date(),
      };

      setReceipts([...receipts, newReceipt]);
      
      // Reset form
      setChurchRegId('');
      setChurchName('');
      setSelectedChurch(null);
      setcosts('');
      setError(null);
    } catch (err) {
      setError('영수증 저장에 실패했습니다.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          이벤트별 영수증 관리
        </Typography>

        {/* Year and Event Selection */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6}>
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
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Receipt Form */}
        {selectedEvent && (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="교회 등록번호"
                  value={churchRegId}
                  onChange={(e) => handleChurchRegIdChange(e.target.value)}
                  placeholder="4자리 입력"
                  inputProps={{ maxLength: 4 }}
                  helperText="교회 등록번호 4자리"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={churches}
                  getOptionLabel={(option) => option.church_Name}
                  value={selectedChurch}
                  onChange={(_, newValue) => {
                    setSelectedChurch(newValue);
                    if (newValue) {
                      setChurchRegId(newValue.church_reg_ID);
                      setChurchName(newValue.church_Name);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="교회명"
                      value={churchName}
                      onChange={(e) => handleChurchNameChange(e.target.value)}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="금액"
                  type="number"
                  value={costs}
                  onChange={(e) => setcosts(e.target.value)}
                  InputProps={{
                    endAdornment: <Typography>원</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                  sx={{ height: '56px' }}
                >
                  {isLoading ? <CircularProgress size={24} /> : '영수증 추가'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Receipts List */}
        {receipts.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              등록된 영수증 목록
            </Typography>
            <List>
              {receipts
                .filter(receipt => receipt.eventId.toString() === selectedEvent)
                .map((receipt) => (
                <ListItem
                  key={receipt.id}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={`${receipt.churchName} (${receipt.churchRegId})`}
                    secondary={`${receipt.costs.toLocaleString()}원 - ${receipt.createdAt.toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default EventReceiptManagePage; 