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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
} from '@mui/material';
import {
  ArrowBack,
  QrCodeScanner,
  Person,
  Refresh,
  Add as AddIcon,
  Download,
  Analytics,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';

interface AttendanceRecord {
  _id: string;
  teacherId: string;
  teacherName: string;
  teacherPhone: string;
  keyCode: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'late' | 'absent' | 'early-leave';
  method: 'qr' | 'manual' | 'admin';
  location: string;
  notes?: string;
}

interface SessionInfo {
  sessionId: string;
  title: string;
  description: string;
  sessionType: 'morning' | 'afternoon' | 'evening' | 'full-day';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

const BTAttendancePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [qrScanDialog, setQrScanDialog] = useState(false);
  const [manualDialog, setManualDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [manualFormData, setManualFormData] = useState({
    teacherName: '',
    teacherPhone: '',
    keyCode: '',
    status: 'present' as 'present' | 'late' | 'absent',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data - 실제로는 API에서 불러와야 함
      const mockSessionInfo: SessionInfo = {
        sessionId: sessionId || '',
        title: '하반기 BT - 1일차 오전',
        description: '성경교육 기초 이론',
        sessionType: 'morning',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '12:00',
        location: '본당',
        maxParticipants: 50,
        currentParticipants: 23,
        status: 'active',
      };

      const mockAttendance: AttendanceRecord[] = [
        {
          _id: '1',
          teacherId: 'teacher1',
          teacherName: '김교사',
          teacherPhone: '010-1234-5678',
          keyCode: 'BT2025-CH001-001',
          checkInTime: '2025-01-15T08:55:00Z',
          status: 'present',
          method: 'qr',
          location: '본당',
        },
        {
          _id: '2',
          teacherId: 'teacher2',
          teacherName: '이교사',
          teacherPhone: '010-2345-6789',
          keyCode: 'BT2025-CH001-002',
          checkInTime: '2025-01-15T09:15:00Z',
          status: 'late',
          method: 'qr',
          location: '본당',
        },
        {
          _id: '3',
          teacherId: 'teacher3',
          teacherName: '박교사',
          teacherPhone: '010-3456-7890',
          keyCode: 'BT2025-CH001-003',
          checkInTime: '2025-01-15T09:02:00Z',
          checkOutTime: '2025-01-15T11:30:00Z',
          status: 'early-leave',
          method: 'manual',
          location: '본당',
          notes: '개인 사정으로 조기 퇴실',
        },
      ];

      setSessionInfo(mockSessionInfo);
      setAttendanceRecords(mockAttendance);
      
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

  const handleQRScan = async () => {
    if (!qrCode.trim()) {
      setSnackbar({
        open: true,
        message: 'QR 코드를 입력해주세요.',
        severity: 'error',
      });
      return;
    }

    try {
      // Mock QR scan processing
      const newRecord: AttendanceRecord = {
        _id: Date.now().toString(),
        teacherId: `teacher_${Date.now()}`,
        teacherName: '신교사',
        teacherPhone: '010-9999-8888',
        keyCode: qrCode,
        checkInTime: new Date().toISOString(),
        status: 'present',
        method: 'qr',
        location: sessionInfo?.location || '',
      };

      setAttendanceRecords([...attendanceRecords, newRecord]);
      
      setSnackbar({
        open: true,
        message: `${newRecord.teacherName}님이 출석 체크되었습니다.`,
        severity: 'success',
      });

      setQrScanDialog(false);
      setQrCode('');
      
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: 'QR 스캔 처리 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const handleManualCheckIn = async () => {
    try {
      const newRecord: AttendanceRecord = {
        _id: Date.now().toString(),
        teacherId: `teacher_${Date.now()}`,
        teacherName: manualFormData.teacherName,
        teacherPhone: manualFormData.teacherPhone,
        keyCode: manualFormData.keyCode,
        checkInTime: new Date().toISOString(),
        status: manualFormData.status,
        method: 'manual',
        location: sessionInfo?.location || '',
        notes: manualFormData.notes,
      };

      setAttendanceRecords([...attendanceRecords, newRecord]);
      
      setSnackbar({
        open: true,
        message: `${newRecord.teacherName}님이 수동으로 출석 처리되었습니다.`,
        severity: 'success',
      });

      setManualDialog(false);
      setManualFormData({
        teacherName: '',
        teacherPhone: '',
        keyCode: '',
        status: 'present',
        notes: '',
      });
      
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '수동 출석 처리 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      case 'early-leave': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return '출석';
      case 'late': return '지각';
      case 'absent': return '결석';
      case 'early-leave': return '조기퇴실';
      default: return status;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'qr': return 'QR 스캔';
      case 'manual': return '수동 입력';
      case 'admin': return '관리자';
      default: return method;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const attendanceRate = attendanceRecords.length > 0 
    ? Math.round(((presentCount + lateCount) / attendanceRecords.length) * 100) 
    : 0;

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
          출결 관리 - {sessionInfo?.title}
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchData}
          variant="outlined"
        >
          새로고침
        </Button>
      </Box>

      {/* 세션 정보 카드 */}
      {sessionInfo && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>세션 정보</Typography>
                <Typography variant="body2">제목: {sessionInfo.title}</Typography>
                <Typography variant="body2">설명: {sessionInfo.description}</Typography>
                <Typography variant="body2">장소: {sessionInfo.location}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>일정</Typography>
                <Typography variant="body2">
                  날짜: {new Date(sessionInfo.date).toLocaleDateString('ko-KR')}
                </Typography>
                <Typography variant="body2">
                  시간: {sessionInfo.startTime} - {sessionInfo.endTime}
                </Typography>
                <Typography variant="body2">
                  상태: <Chip label={sessionInfo.status} color="primary" size="small" />
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 출결 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>총 출결</Typography>
              <Typography variant="h4">{attendanceRecords.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>출석</Typography>
              <Typography variant="h4" color="success.main">{presentCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>지각</Typography>
              <Typography variant="h4" color="warning.main">{lateCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>출석률</Typography>
              <Typography variant="h4">{attendanceRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 액션 버튼 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<QrCodeScanner />}
          onClick={() => setQrScanDialog(true)}
        >
          QR 스캔
        </Button>
        <Button
          variant="outlined"
          startIcon={<Person />}
          onClick={() => setManualDialog(true)}
        >
          수동 출석
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
        >
          엑셀 다운로드
        </Button>
        <Button
          variant="outlined"
          startIcon={<Analytics />}
        >
          통계 보기
        </Button>
      </Box>

      {/* 출결 기록 테이블 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>교사명</TableCell>
                <TableCell>연락처</TableCell>
                <TableCell>키 코드</TableCell>
                <TableCell>체크인</TableCell>
                <TableCell>체크아웃</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>방법</TableCell>
                <TableCell>비고</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {record.teacherName}
                    </Typography>
                  </TableCell>
                  <TableCell>{record.teacherPhone}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      {record.keyCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTime(record.checkInTime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {record.checkOutTime 
                      ? formatTime(record.checkOutTime)
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(record.status)}
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {getMethodText(record.method)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {record.notes || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* QR 스캔 다이얼로그 */}
      <Dialog open={qrScanDialog} onClose={() => setQrScanDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR 코드 스캔</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              교사의 QR 코드를 스캔하거나 직접 입력하세요.
            </Alert>
            
            <TextField
              fullWidth
              label="QR 코드"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="BT2025-CH001-001-12345-ABC123"
              sx={{ mb: 2 }}
              autoFocus
            />
            
            <Typography variant="body2" color="text.secondary">
              QR 코드는 교사가 BT 앱에서 생성한 코드입니다.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrScanDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleQRScan}
            disabled={!qrCode.trim()}
            startIcon={<CheckCircle />}
          >
            출석 체크
          </Button>
        </DialogActions>
      </Dialog>

      {/* 수동 출석 다이얼로그 */}
      <Dialog open={manualDialog} onClose={() => setManualDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>수동 출석 처리</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="교사 이름"
              value={manualFormData.teacherName}
              onChange={(e) => setManualFormData({...manualFormData, teacherName: e.target.value})}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="전화번호"
              value={manualFormData.teacherPhone}
              onChange={(e) => setManualFormData({...manualFormData, teacherPhone: e.target.value})}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="키 코드"
              value={manualFormData.keyCode}
              onChange={(e) => setManualFormData({...manualFormData, keyCode: e.target.value})}
              sx={{ mb: 2 }}
              required
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>출결 상태</InputLabel>
              <Select
                value={manualFormData.status}
                onChange={(e) => setManualFormData({...manualFormData, status: e.target.value as any})}
              >
                <MenuItem value="present">출석</MenuItem>
                <MenuItem value="late">지각</MenuItem>
                <MenuItem value="absent">결석</MenuItem>
                <MenuItem value="early-leave">조기퇴실</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="비고"
              value={manualFormData.notes}
              onChange={(e) => setManualFormData({...manualFormData, notes: e.target.value})}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleManualCheckIn}
            disabled={!manualFormData.teacherName || !manualFormData.teacherPhone || !manualFormData.keyCode}
          >
            출석 처리
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

export default BTAttendancePage;
