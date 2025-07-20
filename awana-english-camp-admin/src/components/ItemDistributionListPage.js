import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stack, Switch, FormControlLabel, CircularProgress, Toolbar, AppBar, IconButton, Alert
} from '@mui/material';
import { ArrowBack, Inventory, CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';

const ItemDistributionListPage = () => {
  const [students, setStudents] = useState([]);
  const [distributedMap, setDistributedMap] = useState({}); // { student_id: distributed_at }
  const [loading, setLoading] = useState(true);
  const [showUndistributedOnly, setShowUndistributedOnly] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all students
      const studentsRes = await axios.get(`${BACKEND_URL}/admin/students?limit=all`);
      const studentsData = studentsRes.data.data || [];
      // Fetch all distributed
      const distributedRes = await axios.get(`${BACKEND_URL}/item-distribution/completed`);
      const distributedList = distributedRes.data || [];
      // Map student_id to distributed_at
      const distributed = {};
      distributedList.forEach(item => {
        distributed[item.student_id] = item.distributed_at;
      });
      setStudents(studentsData);
      setDistributedMap(distributed);
      setLoading(false);
    } catch (err) {
      setAlert({ type: 'error', message: '데이터를 불러오는 중 오류가 발생했습니다.' });
      setLoading(false);
    }
  };

  const filteredStudents = showUndistributedOnly
    ? students.filter(stu => !distributedMap[stu.id])
    : students;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <AppBar position="static" elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
            전체 학생 물품 수령 현황
          </Typography>
        </Toolbar>
      </AppBar>
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>
      )}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">
            전체 학생 목록 ({filteredStudents.length}명)
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showUndistributedOnly}
                onChange={e => setShowUndistributedOnly(e.target.checked)}
                color="warning"
              />
            }
            label={<Typography variant="body2">🔍 미수령자만 보기</Typography>}
          />
        </Stack>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>데이터 로딩 중...</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>교회</TableCell>
                  <TableCell>옷사이즈</TableCell>
                  <TableCell>조/그룹</TableCell>
                  <TableCell>수령상태</TableCell>
                  <TableCell>수령시간</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {showUndistributedOnly ? '🎉 모든 학생이 물품을 수령했습니다!' : '대상자가 없습니다.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map(stu => (
                    <TableRow key={stu.id}>
                      <TableCell>{stu.koreanName} {stu.englishName && `(${stu.englishName})`}</TableCell>
                      <TableCell>{stu.churchName}</TableCell>
                      <TableCell>{stu.shirtSize}</TableCell>
                      <TableCell>{stu.studentGroup || ''} {stu.team ? `${stu.team}조` : ''}</TableCell>
                      <TableCell>
                        {distributedMap[stu.id] ? (
                          <Chip label="수령" color="success" icon={<CheckCircle />} />
                        ) : (
                          <Chip label="미수령" color="default" icon={<Cancel />} />
                        )}
                      </TableCell>
                      <TableCell>
                        {distributedMap[stu.id] ? new Date(distributedMap[stu.id]).toLocaleString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ItemDistributionListPage; 