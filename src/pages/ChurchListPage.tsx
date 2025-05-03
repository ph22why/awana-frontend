import React, { useState, useEffect } from 'react';
import { churchApi, Church, PaginationInfo } from '../services/api/churchApi';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchChurches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await churchApi.searchChurches({
          getAllResults: true,
          name: searchTerm || undefined,
        });
        setAllChurches(response.data);
      } catch (err) {
        setError('교회 목록을 불러오는데 실패했습니다.');
        setAllChurches([]);
      } finally {
        setLoading(false);
      }
    };
    const debounceTimer = setTimeout(fetchChurches, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    // 검색어가 있으면 프론트에서 필터링 (이름, mainId 부분 일치)
    let filtered = allChurches;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      filtered = allChurches.filter(church =>
        (church.name && church.name.toLowerCase().includes(term)) ||
        (church.mainId && church.mainId.toLowerCase().includes(term))
      );
    }
    // 페이지네이션 처리
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    setChurches(filtered.slice(startIdx, endIdx));
  }, [allChurches, searchTerm, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(allChurches.length / pageSize));

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        교회 목록
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="교회 이름 또는 지역으로 검색"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // Reset to first page on new search
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
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