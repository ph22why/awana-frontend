import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { Autocomplete } from '@mui/material';
import { Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { EventFormData, SampleEvent } from '../../types/event';
import type { ReceiptFormData } from '../../types/receipt';
import { eventApi } from '../../services/api/eventApi';
import { receipApi } from '../../services/api/receipApi';
export interface Receipt {
  id: string;
  churchId: string;
  churchName: string;
  amount: number;
  date: string;
  type: '회비' | '교재비' | '기타';
  status: '발행완료' | '발행중' | '미발행';
}

interface Church {
  mainId: string;
  subId: string;
  name: string;
  location: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}


interface ChurchApiResponse {
  success: boolean;
  data: Church[];
  count: number;
  error?: string;
}
const API_BASE_URL = process.env.REACT_APP_CHURCH_API_URL || 'http://localhost:3002';
// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃 설정
});

 
const receipts: Receipt[] = [
  {
    id: '1',
    churchId: '0001-a',
    churchName: '서울중앙교회',
    amount: 500000,
    date: '2024-03-15',
    type: '회비',
    status: '발행완료',
  },
  {
    id: '2',
    churchId: '0002-a',
    churchName: '부산성도교회',
    amount: 300000,
    date: '2024-03-14',
    type: '교재비',
    status: '발행중',
  },
  {
    id: '3',
    churchId: '0003-a',
    churchName: '대구은혜교회',
    amount: 450000,
    date: '2024-03-13',
    type: '회비',
    status: '발행완료',
  },
];




const ReceiptManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedChurchId, setSelectedChurchId] = useState('');
  const [churchIdInput, setChurchIdInput] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [partTotal, setPartTotal] = useState('');
  const [partStudent, setPartStudent] = useState('');
  const [partTeacher, setPartTeacher] = useState('');
  const [partYM, setPartYM] = useState('');
  const [costs, setCosts] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  

    const [churches, setChurches] = useState<Church[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState<number>(15);
  
  
  const fetchChurches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get<ChurchApiResponse>('/api/churches', {
        params: {
          page: page,
          limit: pageSize,  // pageSize를 limit으로 변경
          search: debouncedSearchTerm || undefined  // 빈 문자열일 경우 undefined로 설정
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        const totalItems = response.data.count || 0;
        setChurches(response.data.data || []);
        setTotalPages(Math.max(1, Math.ceil(totalItems / pageSize)));
      } else {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching churches:', err);
      setError('교회 목록을 불러오는데 실패했습니다.');
      setChurches([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const selectedChurch = churches.find(ch => ch._id === selectedChurchId);
    if (!selectedChurch) {
      alert('교회를 선택해주세요.');
      return;
    }
  
    const data = {
      churchId: `${selectedChurch.mainId}-${selectedChurch.subId}`,
      churchName: selectedChurch.name,
      managerPhone,
      partTotal: Number(partTotal),
      partStudent: Number(partStudent),
      partTeacher: Number(partTeacher),
      partYM: Number(partYM),
      costs: Number(costs),
    };


    try {
          setLoading(true);
          await receipApi.createReceipt(formData as ReceiptFormData);
          setSnackbar({
            open: true,
            message: '영수증 등록을 완료하였습니다.',
            severity: 'success'
          });
          navigate('/admin');
        } catch (error) {
          console.error('Error creating event:', error);
          setSnackbar({
            open: true,
            message: '영수증 등록에 실패했습니다.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }

  
    console.log('저장할 데이터:', data);
  

  };
  

  
  const handleView = (id: string) => {
    navigate(`/admin/receipts/${id}`);
  };

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

  useEffect(() => {
    fetchChurches();
  }, []);
  
  useEffect(() => {
    const selected = churches.find(ch => ch._id === selectedChurchId);
    if (selected) {
      setChurchIdInput(`${selected.mainId}`);
    } else {
      setChurchIdInput('');
    }
  }, [selectedChurchId]);
  
  
  

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

    

  const handleDownload = (id: string) => {
    // TODO: Implement download functionality
    console.log('Download receipt:', id);
  };
  const [sampleEvents, setSampleEvents] = useState<SampleEvent[]>([]);
  const [matchedChurches, setMatchedChurches] = useState<Church[]>([]);

  const [formData, setFormData] = useState<Partial<EventFormData>>({
      event_Open_Available: '비공개'
    });
  const downloadSampleExcel = () => {
    const headers = [
      '등록번호','등록번호 중복시 아이디','년도', '이벤트명',
      '참가인원-전체', '참가인원-학생', '참가인원-선생', '참가인원-ym', '비용'
    ];
  
    const sampleData = [headers]; // 헤더만 있는 빈 데이터 생성
  
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
  
    XLSX.utils.book_append_sheet(workbook, worksheet, '샘플');
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
    saveAs(data, '영수증업로드양식.xlsx');
  };


  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
  
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as Array<Array<any>>;
  
      const [header, ...rows] = jsonData;
  
      const expectedHeaders = [
           '등록번호','등록번호 중복시 아이디','년도', '이벤트명',
          '참가인원-전체', '참가인원-학생', '참가인원-선생', '참가인원-ym', '비용'
      ];
  
      if (JSON.stringify(header) !== JSON.stringify(expectedHeaders)) {
        alert('엑셀 양식이 올바르지 않습니다. 샘플 파일을 확인하세요.');
        return;
      }
  
      const parsedData = rows.map((row) => ({
        church_reg_ID: row[0],
        church_sub_ID: row[1],
        event_Year: row[2],
        event_Name: row[3],
        part_total: row[4],
        part_student: row[5],
        part_teacher: row[6],
        part_ym: row[7],
        costs: row[8],
      }));
  
      console.log(parsedData);
    };
  
    reader.readAsArrayBuffer(file);
  };
  

  const handleChurchIdInputChange = (input: string) => {
    setChurchIdInput(input);
  
    const matches = churches.filter((church) => church.mainId === input);
    setMatchedChurches(matches);
  
    if (matches.length === 1) {
      setSelectedChurchId(matches[0]._id);
    } else {
      setSelectedChurchId('');
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

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        영수증 관리
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="교회명 또는 영수증 번호 검색"
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Button variant="contained" onClick={downloadSampleExcel}>
          샘플 엑셀 다운로드
        </Button>
        <Button variant="outlined" component="label">
      엑셀 파일 업로드
      <input type="file" hidden accept=".xlsx,.xls" onChange={handleExcelUpload} />
    </Button>


        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>영수증 종류</InputLabel>
          <Select label="영수증 종류" defaultValue="all">
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="회비">회비</MenuItem>
            <MenuItem value="교재비">교재비</MenuItem>
            <MenuItem value="기타">기타</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>상태</InputLabel>
          <Select label="상태" defaultValue="all">
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="발행완료">발행완료</MenuItem>
            <MenuItem value="발행중">발행중</MenuItem>
            <MenuItem value="미발행">미발행</MenuItem>
          </Select>
        </FormControl>
      </Box>
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
    <IconButton
      onClick={() => setShowForm(prev => !prev)}
      color="primary"
      size="large"
    >
      {showForm ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </IconButton>
    </Box>
  
  {showForm && (
  <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2,mb: 2 }}>
  {/* 1줄: 연도 / 이벤트명 / 교회명 / 등록번호 */}
  <Grid container spacing={2}>

  {/* 연도 선택 */}
  <Grid item xs={3}>
    <FormControl size="small" fullWidth>
      <InputLabel id="year-select-label">연도</InputLabel>
      <Select
        labelId="year-select-label"
        label="연도"
        defaultValue="2024"
      >
        <MenuItem value="2024">2024년</MenuItem>
        <MenuItem value="2023">2023년</MenuItem>
        <MenuItem value="2022">2022년</MenuItem>
        <MenuItem value="2021">2021년</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  {/* 이벤트명 선택 */}
  <Grid item xs={3}>
    <FormControl size="small" fullWidth>
      <InputLabel id="event-select-label">이벤트명</InputLabel>
      <Select
        labelId="event-select-label"
        label="이벤트명"
        value={sampleEvents.find(event =>
          `${event.sampleEvent_Name} ${new Date().getFullYear()}` === formData.event_Name
        )?.sampleEvent_ID.toString() || ''}
        onChange={handleEventNameSelect}
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

  {/* 등록번호 입력 */}
  <Grid item xs={3}>
    <TextField
      label="등록번호"
      size="small"
      value={churchIdInput}
      onChange={(e) => handleChurchIdInputChange(e.target.value)}
      fullWidth
    />
  </Grid>

  {/* 교회 선택 */}
  <Grid item xs={3}>
    <FormControl size="small" fullWidth>
      <InputLabel id="church-select-label">교회 선택</InputLabel>
      <Select
        labelId="church-select-label"
        label="교회 선택"
        value={selectedChurchId}
        onChange={(e) => setSelectedChurchId(e.target.value)}
        disabled={matchedChurches.length === 0}
      >
        {matchedChurches.map((church) => (
          <MenuItem key={church._id} value={church._id}>
            {church.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>

</Grid>


        {/* 2줄: 나머지 입력 항목들 */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={2}>
            <TextField
              label="담당자 전화번호"
              size="small"
              fullWidth
              value={managerPhone}
              onChange={(e) => setManagerPhone(e.target.value)}
            />
          </Grid>

          <Grid item xs={2}>
            <TextField
              label="전체 인원"
              size="small"
              fullWidth
              type="number"
              value={partTotal}
              onChange={(e) => setPartTotal(e.target.value)}
            />
          </Grid>

          <Grid item xs={2}>
            <TextField
              label="학생 수"
              size="small"
              fullWidth
              type="number"
              value={partStudent}
              onChange={(e) => setPartStudent(e.target.value)}
            />
          </Grid>

          <Grid item xs={2}>
            <TextField
              label="선생 수"
              size="small"
              fullWidth
              type="number"
              value={partTeacher}
              onChange={(e) => setPartTeacher(e.target.value)}
            />
          </Grid>

          <Grid item xs={2}>
            <TextField
              label="YM 수"
              size="small"
              fullWidth
              type="number"
              value={partYM}
              onChange={(e) => setPartYM(e.target.value)}
            />
          </Grid>

          <Grid item xs={2}>
            <TextField
              label="비용"
              size="small"
              fullWidth
              type="number"
              value={costs}
              onChange={(e) => setCosts(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          저장
        </Button>
      </Box>
      </Box>
      
      )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>영수증 번호</TableCell>
              <TableCell>교회</TableCell>
              <TableCell>금액</TableCell>
              <TableCell>날짜</TableCell>
              <TableCell>종류</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="right">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>{receipt.id}</TableCell>
                <TableCell>{`${receipt.churchName} (${receipt.churchId})`}</TableCell>
                <TableCell>
                  {receipt.amount.toLocaleString()}원
                </TableCell>
                <TableCell>
                  {new Date(receipt.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{receipt.type}</TableCell>
                <TableCell>{receipt.status}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleView(receipt.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleDownload(receipt.id)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReceiptManagePage; 