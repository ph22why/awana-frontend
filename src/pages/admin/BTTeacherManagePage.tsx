import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  PersonAdd,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { btApi, ChurchManager } from '../../services/api/btApi';

interface BTTeacher {
  _id: string;
  teacherName: string;
  teacherPhone: string;
  teacherEmail: string;
  position?: string;
  experience?: string;
  specialNotes?: string;
  status: 'registered' | 'cancelled';
  registrationDate: string;
  createdAt: string;
}

const BTTeacherManagePage: React.FC = () => {
  const { churchManagerId } = useParams<{ churchManagerId: string }>();
  const navigate = useNavigate();
  
  const [churchManager, setChurchManager] = useState<ChurchManager | null>(null);
  const [teachers, setTeachers] = useState<BTTeacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    teacherName: '',
    teacherPhone: '',
    teacherEmail: '',
    position: '',
    experience: '',
    specialNotes: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (churchManagerId) {
      fetchChurchManager();
      fetchTeachers();
    }
  }, [churchManagerId]);

  const fetchChurchManager = async () => {
    try {
      const manager = await btApi.getChurchManagerById(churchManagerId!);
      setChurchManager(manager);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '교회 정보를 불러오는데 실패했습니다.',
        severity: 'error',
      });
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      // BT API에 교사 목록 조회 메서드 추가 필요
      const response = await fetch(`/api/bt/church-managers/${churchManagerId}/teachers`);
      const data = await response.json();
      
      if (data.success) {
        setTeachers(data.data);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '교사 목록을 불러오는데 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    try {
      const teacherData = {
        ...newTeacher,
        churchManagerId,
        eventId: 'bt-event-2025', // 임시 이벤트 ID
      };

      const response = await fetch('/api/bt/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: '교사가 성공적으로 등록되었습니다.',
          severity: 'success',
        });
        
        fetchTeachers();
        setAddDialog(false);
        setNewTeacher({
          teacherName: '',
          teacherPhone: '',
          teacherEmail: '',
          position: '',
          experience: '',
          specialNotes: '',
        });
      } else {
        throw new Error(data.message || '교사 등록에 실패했습니다.');
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error',
      });
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!window.confirm('정말로 이 교사를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bt/teachers/${teacherId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: '교사가 삭제되었습니다.',
          severity: 'success',
        });
        
        fetchTeachers();
      } else {
        throw new Error(data.message || '교사 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered': return '등록됨';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/bt-manage')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              BT 교사 관리
            </Typography>
            {churchManager && (
              <Typography variant="subtitle1" color="text.secondary">
                {churchManager.churchName} - {churchManager.managerName}
              </Typography>
            )}
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTeachers}
            sx={{ mr: 2 }}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setAddDialog(true)}
          >
            교사 추가
          </Button>
        </Box>
      </Box>

      {/* 교사 목록 테이블 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>연락처</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>직책</TableCell>
                <TableCell>등록일</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell>{teacher.teacherName}</TableCell>
                  <TableCell>{teacher.teacherPhone}</TableCell>
                  <TableCell>{teacher.teacherEmail}</TableCell>
                  <TableCell>{teacher.position || '-'}</TableCell>
                  <TableCell>
                    {new Date(teacher.registrationDate).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(teacher.status)}
                      color={getStatusColor(teacher.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {teacher.status === 'registered' && (
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTeacher(teacher._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {teachers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    등록된 교사가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 교사 추가 다이얼로그 */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>교사 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="이름"
              value={newTeacher.teacherName}
              onChange={(e) => setNewTeacher({...newTeacher, teacherName: e.target.value})}
              required
            />
            
            <TextField
              fullWidth
              label="전화번호"
              value={newTeacher.teacherPhone}
              onChange={(e) => setNewTeacher({...newTeacher, teacherPhone: e.target.value})}
              required
            />
            
            <TextField
              fullWidth
              label="이메일"
              type="email"
              value={newTeacher.teacherEmail}
              onChange={(e) => setNewTeacher({...newTeacher, teacherEmail: e.target.value})}
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>직책</InputLabel>
              <Select
                value={newTeacher.position}
                label="직책"
                onChange={(e) => setNewTeacher({...newTeacher, position: e.target.value})}
              >
                <MenuItem value="교사">교사</MenuItem>
                <MenuItem value="전도사">전도사</MenuItem>
                <MenuItem value="목사">목사</MenuItem>
                <MenuItem value="장로">장로</MenuItem>
                <MenuItem value="권사">권사</MenuItem>
                <MenuItem value="집사">집사</MenuItem>
                <MenuItem value="기타">기타</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="교육 경력"
              multiline
              rows={2}
              value={newTeacher.experience}
              onChange={(e) => setNewTeacher({...newTeacher, experience: e.target.value})}
            />
            
            <TextField
              fullWidth
              label="특이사항"
              multiline
              rows={2}
              value={newTeacher.specialNotes}
              onChange={(e) => setNewTeacher({...newTeacher, specialNotes: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleAddTeacher}
            disabled={!newTeacher.teacherName || !newTeacher.teacherPhone || !newTeacher.teacherEmail}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BTTeacherManagePage;
