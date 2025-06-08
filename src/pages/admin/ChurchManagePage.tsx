import React, { useState, useEffect, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';

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

interface ChurchFormData {
  mainId: string;
  subId: string;
  name: string;
  location: string;
}

const API_BASE_URL = 'https://awanaevent.com:3002';
// const API_BASE_URL = process.env.REACT_APP_CHURCH_API_URL || 'https://awanaevent.com:3002';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃 설정
});

const ChurchManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useOutletContext<{ role: string }>();
  const [churches, setChurches] = useState<Church[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChurch, setEditingChurch] = useState<Church | null>(null);
  const [formData, setFormData] = useState<ChurchFormData>({
    mainId: '',
    subId: '',
    name: '',
    location: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(15);

  // 검색어 디바운싱 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 검색어가 변경될 때마다 첫 페이지로 이동
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, pageSize]);

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

  useEffect(() => {
    fetchChurches();
  }, [page, debouncedSearchTerm, pageSize]);

  const handleOpenDialog = (church?: Church) => {
    if (church) {
      setEditingChurch(church);
      setFormData({
        mainId: church.mainId,
        subId: church.subId,
        name: church.name,
        location: church.location
      });
    } else {
      setEditingChurch(null);
      setFormData({
        mainId: '',
        subId: '',
        name: '',
        location: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingChurch(null);
    setFormData({
      mainId: '',
      subId: '',
      name: '',
      location: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingChurch) {
        await axiosInstance.put(`/api/churches/${editingChurch.mainId}/${editingChurch.subId}`, {
          name: formData.name,
          location: formData.location
        });
      } else {
        await axiosInstance.post('/api/churches', formData);
      }
      handleCloseDialog();
      fetchChurches();
    } catch (error) {
      console.error('Error saving church:', error);
    }
  };

  const handleDelete = async (church: Church) => {
    if (window.confirm('정말로 이 교회를 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(`/api/churches/${church.mainId}/${church.subId}`);
        fetchChurches();
      } catch (error) {
        console.error('Error deleting church:', error);
      }
    }
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
  };

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
        교회 관리
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="교회명, 주소, ID로 검색"
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>페이지당 항목</InputLabel>
          <Select
            value={pageSize}
            label="페이지당 항목"
            onChange={handlePageSizeChange}
          >
            <MenuItem value={10}>10개</MenuItem>
            <MenuItem value={15}>15개</MenuItem>
            <MenuItem value={20}>20개</MenuItem>
            <MenuItem value={30}>30개</MenuItem>
            <MenuItem value={50}>50개</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          새 교회 등록
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>교회 ID</TableCell>
              <TableCell>교회명</TableCell>
              <TableCell>주소</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {churches.length > 0 ? (
              churches.map((church) => (
                <TableRow key={`${church.mainId}-${church.subId}`}>
                  <TableCell>{`${church.mainId}-${church.subId}`}</TableCell>
                  <TableCell>{church.name}</TableCell>
                  <TableCell>{church.location}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(church)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(church)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {error ? error : '검색 결과가 없습니다.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          disabled={loading}
        />
        <Typography variant="body2" color="text.secondary">
          총 {churches.length}개 항목 (페이지당 {pageSize}개)
        </Typography>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingChurch ? '교회 수정' : '교회 추가'}</DialogTitle>
        <DialogContent>
          {!editingChurch && (
            <>
              <TextField
                fullWidth
                label="교회 ID (4자리)"
                value={formData.mainId}
                onChange={(e) => setFormData({ ...formData, mainId: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="교회 서브 ID (1자리 알파벳)"
                value={formData.subId}
                onChange={(e) => setFormData({ ...formData, subId: e.target.value })}
                margin="normal"
              />
            </>
          )}
          <TextField
            fullWidth
            label="교회명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="주소"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChurchManagePage; 