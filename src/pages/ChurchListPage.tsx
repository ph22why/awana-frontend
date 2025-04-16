import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface Church {
  id: string;
  mainId: string;
  subId: string;
  name: string;
  location: string;
  contact: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ChurchListResponse {
  success: boolean;
  data: {
    churches: Church[];
    pagination: Pagination;
  };
  error?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const ChurchListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        if (!loading) {
          setLoading(true);
          setError(null);
          const response = await axios.get<ChurchListResponse>(`${API_BASE_URL}/api/churches`, {
            params: {
              page,
              limit: 12,
              search: searchTerm
            }
          });
          
          const data = response.data;
          
          if (data.success) {
            setChurches(data.data.churches);
            const paginationData = {
              ...data.data.pagination,
              totalPages: Math.ceil(data.data.pagination.total / data.data.pagination.limit)
            };
            setPagination(paginationData);
          } else {
            throw new Error(data.error || '데이터를 불러오는데 실패했습니다.');
          }
        }
      } catch (err) {
        console.error('Error fetching churches:', err);
        setError('교회 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchChurches, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, page]);

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
          <Grid container spacing={3}>
            {churches.map((church) => (
              <Grid item key={church.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {church.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      교회 ID: {church.mainId}-{church.subId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      위치: {church.location}
                    </Typography>
                    {church.contact && (
                      <Typography variant="body2" color="text.secondary">
                        연락처: {church.contact}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {churches.length === 0 ? (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                검색 결과가 없습니다.
              </Typography>
            </Box>
          ) : pagination && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ChurchListPage; 