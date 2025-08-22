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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  ContentCopy,
  Person,
  Key as KeyIcon,
  Check,
  Refresh,
  QrCode,
} from '@mui/icons-material';

interface BTKey {
  _id: string;
  keyCode: string;
  status: 'available' | 'assigned' | 'used' | 'expired';
  assignedTeacherId?: string;
  assignedDate?: string;
  usedDate?: string;
  qrCode?: string;
  qrGeneratedAt?: string;
  metadata?: {
    churchName?: string;
    managerPhone?: string;
  };
}

interface Teacher {
  _id: string;
  teacherName: string;
  teacherPhone: string;
  teacherEmail: string;
}

const BTKeyManagePage: React.FC = () => {
  const { churchManagerId } = useParams<{ churchManagerId: string }>();
  const navigate = useNavigate();
  
  const [keys, setKeys] = useState<BTKey[]>([]);
  const [churchInfo, setChurchInfo] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<BTKey | null>(null);
  const [teacherFormData, setTeacherFormData] = useState({
    teacherName: '',
    teacherPhone: '',
    teacherEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (churchManagerId) {
      fetchData();
    }
  }, [churchManagerId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data - 실제로는 API에서 불러와야 함
      const mockKeys: BTKey[] = [
        {
          _id: '1',
          keyCode: 'BT2025-CH001-001',
          status: 'available',
          metadata: {
            churchName: '서울중앙교회',
            managerPhone: '010-1234-5678',
          },
        },
        {
          _id: '2',
          keyCode: 'BT2025-CH001-002',
          status: 'assigned',
          assignedTeacherId: 'teacher1',
          assignedDate: new Date().toISOString(),
          metadata: {
            churchName: '서울중앙교회',
            managerPhone: '010-1234-5678',
          },
        },
        {
          _id: '3',
          keyCode: 'BT2025-CH001-003',
          status: 'used',
          assignedTeacherId: 'teacher2',
          assignedDate: new Date().toISOString(),
          usedDate: new Date().toISOString(),
          qrCode: 'BT2025-CH001-003-12345-ABC123',
          qrGeneratedAt: new Date().toISOString(),
          metadata: {
            churchName: '서울중앙교회',
            managerPhone: '010-1234-5678',
          },
        },
      ];
      
      setKeys(mockKeys);
      setChurchInfo({
        churchName: '서울중앙교회',
        managerName: '김목사',
        managerPhone: '010-1234-5678',
        participants: 5,
      });

      const mockTeachers: Teacher[] = [
        {
          _id: 'teacher1',
          teacherName: '이교사',
          teacherPhone: '010-2345-6789',
          teacherEmail: 'teacher1@church.kr',
        },
        {
          _id: 'teacher2',
          teacherName: '박교사',
          teacherPhone: '010-3456-7890',
          teacherEmail: 'teacher2@church.kr',
        },
      ];
      setTeachers(mockTeachers);
      
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '데이터를 불러오는데 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignKey = async () => {
    if (!selectedKey) return;

    try {
      // 새 교사 생성 및 키 할당
      const newTeacher: Teacher = {
        _id: Date.now().toString(),
        ...teacherFormData,
      };

      // Mock assignment
      const updatedKey = {
        ...selectedKey,
        status: 'assigned' as const,
        assignedTeacherId: newTeacher._id,
        assignedDate: new Date().toISOString(),
      };

      setKeys(keys.map(k => k._id === selectedKey._id ? updatedKey : k));
      setTeachers([...teachers, newTeacher]);

      setSnackbar({
        open: true,
        message: '키가 교사에게 할당되었습니다.',
        severity: 'success',
      });

      setAssignDialog(false);
      setSelectedKey(null);
      setTeacherFormData({
        teacherName: '',
        teacherPhone: '',
        teacherEmail: '',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '키 할당 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const openAssignDialog = (key: BTKey) => {
    setSelectedKey(key);
    setAssignDialog(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({
        open: true,
        message: '클립보드에 복사되었습니다.',
        severity: 'success',
      });
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'primary';
      case 'assigned': return 'warning';
      case 'used': return 'success';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '사용 가능';
      case 'assigned': return '할당됨';
      case 'used': return '사용됨';
      case 'expired': return '만료됨';
      default: return status;
    }
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return '-';
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? teacher.teacherName : '알 수 없음';
  };

  const availableKeys = keys.filter(k => k.status === 'available');
  const assignedKeys = keys.filter(k => k.status === 'assigned');
  const usedKeys = keys.filter(k => k.status === 'used');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/bt')}
          variant="outlined"
        >
          BT 관리로
        </Button>
        <Typography variant="h4" component="h1">
          키 관리 - {churchInfo?.churchName}
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchData}
          variant="outlined"
        >
          새로고침
        </Button>
      </Box>

      {/* 교회 정보 카드 */}
      {churchInfo && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>교회 정보</Typography>
                <Typography variant="body2">교회명: {churchInfo.churchName}</Typography>
                <Typography variant="body2">담당자: {churchInfo.managerName}</Typography>
                <Typography variant="body2">연락처: {churchInfo.managerPhone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>키 현황</Typography>
                <Typography variant="body2">총 발급: {keys.length}개</Typography>
                <Typography variant="body2">사용 가능: {availableKeys.length}개</Typography>
                <Typography variant="body2">할당됨: {assignedKeys.length}개</Typography>
                <Typography variant="body2">사용됨: {usedKeys.length}개</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>사용 가능</Typography>
              <Typography variant="h4">{availableKeys.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>할당됨</Typography>
              <Typography variant="h4">{assignedKeys.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>사용됨</Typography>
              <Typography variant="h4">{usedKeys.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>사용률</Typography>
              <Typography variant="h4">
                {keys.length > 0 ? Math.round((usedKeys.length / keys.length) * 100) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 키 목록 테이블 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>키 코드</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>할당된 교사</TableCell>
                <TableCell>할당일</TableCell>
                <TableCell>QR 코드</TableCell>
                <TableCell>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      >
                        {key.keyCode}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(key.keyCode)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(key.status)}
                      color={getStatusColor(key.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {key.assignedTeacherId ? (
                      <Box>
                        <Typography variant="body2">
                          {getTeacherName(key.assignedTeacherId)}
                        </Typography>
                        {teachers.find(t => t._id === key.assignedTeacherId) && (
                          <Typography variant="caption" color="text.secondary">
                            {teachers.find(t => t._id === key.assignedTeacherId)?.teacherPhone}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {key.assignedDate 
                      ? new Date(key.assignedDate).toLocaleDateString('ko-KR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {key.qrCode ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QrCode color="success" />
                        <Typography variant="caption">생성됨</Typography>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {key.status === 'available' && (
                      <Tooltip title="교사에게 할당">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openAssignDialog(key)}
                        >
                          <Person />
                        </IconButton>
                      </Tooltip>
                    )}
                    {key.qrCode && (
                      <Tooltip title="QR 코드 복사">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => copyToClipboard(key.qrCode!)}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 교사 할당 다이얼로그 */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>교사에게 키 할당</DialogTitle>
        <DialogContent>
          {selectedKey && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                키 코드: <strong>{selectedKey.keyCode}</strong>
              </Alert>
              
              <TextField
                fullWidth
                label="교사 이름"
                value={teacherFormData.teacherName}
                onChange={(e) => setTeacherFormData({...teacherFormData, teacherName: e.target.value})}
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                fullWidth
                label="전화번호"
                value={teacherFormData.teacherPhone}
                onChange={(e) => setTeacherFormData({...teacherFormData, teacherPhone: e.target.value})}
                sx={{ mb: 2 }}
                placeholder="010-1234-5678"
                required
              />
              
              <TextField
                fullWidth
                label="이메일"
                type="email"
                value={teacherFormData.teacherEmail}
                onChange={(e) => setTeacherFormData({...teacherFormData, teacherEmail: e.target.value})}
                sx={{ mb: 2 }}
                required
              />
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                할당된 키는 교사가 개인 신청 시 사용할 수 있습니다.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleAssignKey}
            disabled={!teacherFormData.teacherName || !teacherFormData.teacherPhone || !teacherFormData.teacherEmail}
          >
            할당
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

export default BTKeyManagePage;
