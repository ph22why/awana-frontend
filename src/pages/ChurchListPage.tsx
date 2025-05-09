import React, { useState, useEffect } from 'react';
import { churchApi, Church } from '../services/api/churchApi';
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
  Pagination,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const ChurchListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allChurches, setAllChurches] = useState<Church[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 모든 교회 데이터 가져오기
  const fetchAllChurches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await churchApi.searchChurches({ getAllResults: true });
      if (response.success) {
        setAllChurches(response.data || []);
      } else {
        setAllChurches([]);
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching churches:', err);
      setError('교회 목록을 불러오는데 실패했습니다.');
      setAllChurches([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllChurches();
  }, []);

  useEffect(() => {
    // 검색어가 있으면 프론트에서 필터링 (이름, mainId 부분 일치)
    let filtered = allChurches || []; // Ensure filtered is always an array
    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(church =>
        (church.name && church.name.toLowerCase().includes(term)) ||
        (church.mainId && church.mainId.toLowerCase().includes(term))
      );
    }
    // 페이지네이션 처리
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    setChurches(filtered.slice(startIdx, endIdx));
    // 전체 페이지 수 계산
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
  }, [allChurches, searchTerm, page, pageSize]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        교회 목록
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="교회명 또는 등록번호로 검색"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
        <FormControl size="small" sx={{ minWidth: 120, marginLeft: 'auto' }}>
          <InputLabel>페이지당 개수</InputLabel>
          <Select
            value={pageSize}
            label="페이지당 개수"
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <MenuItem value={10}>10개</MenuItem>
            <MenuItem value={30}>30개</MenuItem>
            <MenuItem value={50}>50개</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>교회명</TableCell>
                  <TableCell>교회 ID</TableCell>
                  <TableCell>주소</TableCell>
                  <TableCell>연락처</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {churches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  churches.map((church) => (
                    <TableRow key={church._id}>
                      <TableCell>{church.name}</TableCell>
                      <TableCell>{church.mainId}-{church.subId}</TableCell>
                      <TableCell>{church.location}</TableCell>
                      <TableCell>{church.phone || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default ChurchListPage; 