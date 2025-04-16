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
  InputLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

interface ChurchFormData {
  mainId: string;
  subId: string;
  name: string;
  location: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃 설정
});

const ChurchManagePage: React.FC = () => {
  const navigate = useNavigate();
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
  }, [debouncedSearchTerm]);

  const fetchChurches = async () => {
    try {
      setError(null);
      const response = await axiosInstance.get(`/api/churches?page=${page}&search=${debouncedSearchTerm}&pageSize=${pageSize}`);
      console.log('API Response:', response.data);

      if (response.data && response.data.data) {
        const { churches = [], pagination = { totalPages: 1 } } = response.data.data;
        setChurches(churches);
        setTotalPages(pagination.totalPages);
      } else if (response.data && Array.isArray(response.data)) {
        // 클라이언트 사이드 검색 및 페이지네이션
        const filteredChurches = response.data.filter((church: Church) => {
          const searchLower = debouncedSearchTerm.toLowerCase();
          return (
            church.name.toLowerCase().includes(searchLower) ||
            church.location.toLowerCase().includes(searchLower) ||
            church.mainId.toLowerCase().includes(searchLower) ||
            church.subId.toLowerCase().includes(searchLower)
          );
        });

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setChurches(filteredChurches.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(filteredChurches.length / pageSize));
      } else {
        setError('서버 응답 형식이 올바르지 않습니다.');
        setChurches([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching churches:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setError('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.response?.status === 504) {
          setError('서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError(`데이터를 불러오는 중 오류가 발생했습니다: ${error.response?.status ? `(${error.response.status})` : ''} ${error.message}`);
        }
      } else {
        setError('데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.');
      }
      setChurches([]);
      setTotalPages(1);
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

  const handlePageSizeChange = (event: any) => {
    setPageSize(event.target.value);
    setPage(1); // 페이지 크기가 변경되면 첫 페이지로 이동
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        교회 관리
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="교회명, 위치, ID로 검색"
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
              <TableCell>위치</TableCell>
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
        />
        <Typography variant="body2" color="text.secondary">
          총 {churches.length}개 항목 중 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, churches.length)}
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
            label="위치"
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