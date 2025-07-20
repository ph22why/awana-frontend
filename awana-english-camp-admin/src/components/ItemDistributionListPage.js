import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PinAuthDialog from './PinAuthDialog';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Toolbar,
  AppBar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControlLabel,
  Switch,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Home,
  Search,
  Inventory,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { BACKEND_URL } from "../config";

const ItemDistributionListPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // PIN이 확인되지 않았으면 다른 작업을 하지 않음
    if (!isPinVerified) return;
    
    // 초기화 API 호출
    const initializeSystem = async () => {
      try {
        await axios.post(`${BACKEND_URL}/init-item-distribution`);
        console.log('✅ Item distribution system initialized');
      } catch (error) {
        console.error('Error initializing system:', error);
      }
      fetchData();
    };
    
    initializeSystem();
  }, [isPinVerified]); // Add isPinVerified to dependencies

  const handlePinSuccess = () => {
    setIsPinVerified(true);
  };

  // PIN이 확인되지 않았으면 PIN 입력 다이얼로그만 표시
  if (!isPinVerified) {
    return (
      <PinAuthDialog
        open={true}
        onClose={() => navigate('/')}
        onSuccess={handlePinSuccess}
        requiredPin="6790"
        title="물품 수령 현황 인증"
      />
    );
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 전체 학생 목록 조회 (출석체크 테이블 기준)
      const studentsResponse = await axios.get(`${BACKEND_URL}/attendance/session1?userTypes=student`);
      const allStudents = studentsResponse.data;
      
      // 물품 수령 완료 학생 조회
      const completedResponse = await axios.get(`${BACKEND_URL}/item-distribution/completed`);
      const completedStudents = new Set(completedResponse.data.map(item => item.student_id));
      
      // 학생 데이터와 물품 수령 상태 결합
      const studentsWithStatus = allStudents.map(student => ({
        ...student,
        hasReceivedItems: completedStudents.has(student.id)
      }));

      setStudents(studentsWithStatus);
      setTotalStudents(studentsWithStatus.length);
      setCompletedCount(completedStudents.size);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleShowPendingChange = (event) => {
    setShowOnlyPending(event.target.checked);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.englishName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.churchName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (showOnlyPending) {
      return matchesSearch && !student.hasReceivedItems;
    }
    return matchesSearch;
  });

  const progressPercentage = totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/")}
            sx={{ mr: 2 }}
          >
            <Home />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
            물품 수령 전체 현황
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate("/item-distribution")}
            sx={{ mr: 2 }}
          >
            QR 스캔으로 돌아가기
          </Button>
          <Chip 
            label={`진행률 ${Math.round(progressPercentage)}%`}
            color="secondary"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Toolbar>
      </AppBar>

      {/* Progress Summary */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              물품 수령 진행 상황
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              전체 학생 {totalStudents}명 중 {completedCount}명 완료 ({Math.round(progressPercentage)}%)
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              미수령 학생: {totalStudents - completedCount}명
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="이름, 영문명, 또는 교회로 검색"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyPending}
                  onChange={handleShowPendingChange}
                  color="primary"
                />
              }
              label="미수령 학생만 보기"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Student List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>이름</TableCell>
              <TableCell>영문명</TableCell>
              <TableCell>교회</TableCell>
              <TableCell>물품 수령 상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredStudents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name || student.koreanName}</TableCell>
                    <TableCell>{student.englishName}</TableCell>
                    <TableCell>{student.churchName}</TableCell>
                    <TableCell>
                      {student.hasReceivedItems ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="수령 완료"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<Cancel />}
                          label="미수령"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수:"
        />
      </TableContainer>
    </Container>
  );
};

export default ItemDistributionListPage; 