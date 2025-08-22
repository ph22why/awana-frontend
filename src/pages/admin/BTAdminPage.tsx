import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
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
  Tabs,
  Tab,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Receipt as ReceiptIcon,
  Refresh,
  People,
  School,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule,
  QrCodeScanner,
} from '@mui/icons-material';
import { btApi, ChurchManager } from '../../services/api/btApi';

interface BTSession {
  _id: string;
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
  eventId: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bt-tabpanel-${index}`}
      aria-labelledby={`bt-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BTAdminPage: React.FC = () => {
  const { role } = useOutletContext<{ role: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  
  // 교회 승인 관련 상태
  const [churchManagers, setChurchManagers] = useState<ChurchManager[]>([]);
  const [selectedManager, setSelectedManager] = useState<ChurchManager | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalData, setApprovalData] = useState({
    eventId: '하반기 BT 2025',
    costs: '50000',
    partTeacher: '1',
  });
  
  // 수업 관리 관련 상태
  const [sessions, setSessions] = useState<BTSession[]>([]);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    title: '',
    description: '',
    sessionType: 'morning' as 'morning' | 'afternoon' | 'evening' | 'full-day',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: 50,
    eventId: '하반기 BT 2025',
  });
  const [editingSession, setEditingSession] = useState<BTSession | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/admin');
      return;
    }
    fetchChurchManagers();
    fetchSessions();
  }, [role, navigate]);

  const fetchChurchManagers = async () => {
    try {
      const response = await btApi.getChurchManagers();
      setChurchManagers(response.data);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: 'BT 신청 목록을 불러오는데 실패했습니다.',
        severity: 'error',
      });
    }
  };

  const fetchSessions = async () => {
    // Mock data for sessions - 실제로는 API에서 불러와야 함
    const mockSessions: BTSession[] = [
      {
        _id: '1',
        sessionId: '2025-01-15-AM',
        title: '하반기 BT - 1일차 오전',
        description: '성경교육 기초 이론',
        sessionType: 'morning',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '12:00',
        location: '본당',
        maxParticipants: 50,
        currentParticipants: 23,
        status: 'scheduled',
        eventId: '하반기 BT 2025',
      },
      {
        _id: '2',
        sessionId: '2025-01-15-PM',
        title: '하반기 BT - 1일차 오후',
        description: '실습 및 토론',
        sessionType: 'afternoon',
        date: '2025-01-15',
        startTime: '14:00',
        endTime: '17:00',
        location: '교육관',
        maxParticipants: 50,
        currentParticipants: 23,
        status: 'scheduled',
        eventId: '하반기 BT 2025',
      },
    ];
    setSessions(mockSessions);
  };

  const handleApproval = async (managerId: string, approve: boolean) => {
    try {
      if (approve && selectedManager) {
        await btApi.updateChurchManagerStatus(
          managerId,
          'approved',
          approvalData.eventId,
          parseInt(approvalData.costs),
          parseInt(approvalData.partTeacher)
        );
        
        // 키 생성 요청
        try {
          await fetch('/api/bt/keys/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              churchManagerId: managerId,
              eventId: approvalData.eventId,
              keyCount: parseInt(approvalData.partTeacher),
            }),
          });
        } catch (keyError) {
          console.error('키 생성 오류:', keyError);
        }
        
        setSnackbar({
          open: true,
          message: '승인이 완료되었습니다. 키가 자동으로 생성되었습니다.',
          severity: 'success',
        });
      } else {
        await btApi.updateChurchManagerStatus(managerId, 'rejected');
        setSnackbar({
          open: true,
          message: '신청이 거절되었습니다.',
          severity: 'success',
        });
      }
      
      fetchChurchManagers();
      setApprovalDialog(false);
      setSelectedManager(null);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || '처리 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const openApprovalDialog = (manager: ChurchManager) => {
    setSelectedManager(manager);
    setApprovalData({
      eventId: '하반기 BT 2025',
      costs: '50000',
      partTeacher: manager.participants?.toString() || '1',
    });
    setApprovalDialog(true);
  };

  const handleSessionSubmit = async () => {
    try {
      const sessionId = `${sessionFormData.date}-${sessionFormData.sessionType.toUpperCase()}`;
      const newSession: BTSession = {
        _id: Date.now().toString(),
        sessionId,
        ...sessionFormData,
        currentParticipants: 0,
        status: 'scheduled',
      };

      if (editingSession) {
        // 수정
        setSessions(sessions.map(s => s._id === editingSession._id ? { ...newSession, _id: editingSession._id } : s));
        setSnackbar({
          open: true,
          message: '수업이 수정되었습니다.',
          severity: 'success',
        });
      } else {
        // 새로 생성
        setSessions([...sessions, newSession]);
        setSnackbar({
          open: true,
          message: '새 수업이 생성되었습니다.',
          severity: 'success',
        });
      }
      
      setSessionDialog(false);
      setEditingSession(null);
      setSessionFormData({
        title: '',
        description: '',
        sessionType: 'morning',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: 50,
        eventId: '하반기 BT 2025',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '수업 처리 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const handleEditSession = (session: BTSession) => {
    setEditingSession(session);
    setSessionFormData({
      title: session.title,
      description: session.description,
      sessionType: session.sessionType,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      maxParticipants: session.maxParticipants,
      eventId: session.eventId,
    });
    setSessionDialog(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('정말로 이 수업을 삭제하시겠습니까?')) {
      setSessions(sessions.filter(s => s._id !== sessionId));
      setSnackbar({
        open: true,
        message: '수업이 삭제되었습니다.',
        severity: 'success',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '승인됨';
      case 'rejected': return '거절됨';
      case 'scheduled': return '예정됨';
      case 'active': return '진행중';
      case 'completed': return '완료됨';
      case 'cancelled': return '취소됨';
      default: return '대기중';
    }
  };

  if (role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          이 페이지는 최고 관리자만 접근할 수 있습니다.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          BT 통합 관리
        </Typography>
        <Button onClick={() => navigate('/admin')} variant="outlined">
          대시보드로
        </Button>
      </Box>

      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="교회 승인 관리" icon={<School />} />
          <Tab label="수업 관리" icon={<Schedule />} />
          <Tab label="출결 관리" icon={<QrCodeScanner />} />
        </Tabs>
      </Paper>

      {/* 교회 승인 관리 탭 */}
      <TabPanel value={currentTab} index={0}>
        {/* 통계 카드 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>전체 신청</Typography>
                <Typography variant="h4">{churchManagers.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>대기중</Typography>
                <Typography variant="h4">{churchManagers.filter(cm => cm.status === 'pending').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>승인됨</Typography>
                <Typography variant="h4">{churchManagers.filter(cm => cm.status === 'approved').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>총 키 발급</Typography>
                <Typography variant="h4">
                  {churchManagers.filter(cm => cm.status === 'approved').reduce((sum, cm) => sum + (cm.participants || 0), 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 교회 신청 목록 */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>교회명</TableCell>
                  <TableCell>담당자</TableCell>
                  <TableCell>연락처</TableCell>
                  <TableCell>참가자 수</TableCell>
                  <TableCell>신청일</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {churchManagers.map((manager) => (
                  <TableRow key={manager._id}>
                    <TableCell>
                      <Typography variant="subtitle2">{manager.churchName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {manager.churchAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{manager.managerName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {manager.managerEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>{manager.managerPhone}</TableCell>
                    <TableCell>{manager.participants || '-'}</TableCell>
                    <TableCell>
                      {new Date(manager.registrationDate).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(manager.status)}
                        color={getStatusColor(manager.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {manager.status === 'pending' && (
                          <>
                            <Tooltip title="승인">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openApprovalDialog(manager)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="거절">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleApproval(manager._id, false)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {manager.status === 'approved' && (
                          <Tooltip title="키 관리">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/admin/bt/keys/${manager._id}`)}
                            >
                              <People />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* 수업 관리 탭 */}
      <TabPanel value={currentTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">BT 수업 목록</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingSession(null);
              setSessionDialog(true);
            }}
          >
            새 수업 생성
          </Button>
        </Box>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>수업명</TableCell>
                  <TableCell>날짜/시간</TableCell>
                  <TableCell>장소</TableCell>
                  <TableCell>참가자</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session._id}>
                    <TableCell>
                      <Typography variant="subtitle2">{session.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(session.date).toLocaleDateString('ko-KR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.startTime} - {session.endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>
                      {session.currentParticipants} / {session.maxParticipants}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(session.status)}
                        color={getStatusColor(session.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="수정">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditSession(session)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="삭제">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSession(session._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="출결 관리">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => navigate(`/admin/bt/attendance/${session.sessionId}`)}
                          >
                            <QrCodeScanner />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* 출결 관리 탭 */}
      <TabPanel value={currentTab} index={2}>
        <Typography variant="h6" gutterBottom>출결 관리</Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          출결 관리는 각 수업별로 개별 관리됩니다. 수업 관리 탭에서 각 수업의 출결 관리 버튼을 클릭하세요.
        </Alert>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            • QR 코드 스캔을 통한 실시간 출결 체크
          </Typography>
          <Typography variant="body1" gutterBottom>
            • 세션별 출결 현황 조회
          </Typography>
          <Typography variant="body1" gutterBottom>
            • 출결 통계 및 분석
          </Typography>
          <Typography variant="body1">
            • 지각/결석 자동 판정
          </Typography>
        </Paper>
      </TabPanel>

      {/* 승인 다이얼로그 */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>BT 신청 승인</DialogTitle>
        <DialogContent>
          {selectedManager && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedManager.churchName} - {selectedManager.managerName}
              </Typography>
              
              <TextField
                fullWidth
                label="이벤트 ID"
                value={approvalData.eventId}
                onChange={(e) => setApprovalData({...approvalData, eventId: e.target.value})}
                sx={{ mb: 2 }}
                helperText="BT 이벤트의 ID를 입력하세요"
              />
              
              <TextField
                fullWidth
                label="참가비 (원)"
                type="number"
                value={approvalData.costs}
                onChange={(e) => setApprovalData({...approvalData, costs: e.target.value})}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="참가 교사 수"
                type="number"
                value={approvalData.partTeacher}
                onChange={(e) => setApprovalData({...approvalData, partTeacher: e.target.value})}
                sx={{ mb: 2 }}
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                승인 시 자동으로 키가 생성되고 영수증이 발급됩니다.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={() => selectedManager && handleApproval(selectedManager._id, true)}
            disabled={!approvalData.eventId || !approvalData.costs || !approvalData.partTeacher}
          >
            승인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 수업 생성/수정 다이얼로그 */}
      <Dialog open={sessionDialog} onClose={() => setSessionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSession ? '수업 수정' : '새 수업 생성'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="수업명"
              value={sessionFormData.title}
              onChange={(e) => setSessionFormData({...sessionFormData, title: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="수업 설명"
              value={sessionFormData.description}
              onChange={(e) => setSessionFormData({...sessionFormData, description: e.target.value})}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>세션 타입</InputLabel>
              <Select
                value={sessionFormData.sessionType}
                onChange={(e) => setSessionFormData({...sessionFormData, sessionType: e.target.value as any})}
              >
                <MenuItem value="morning">오전</MenuItem>
                <MenuItem value="afternoon">오후</MenuItem>
                <MenuItem value="evening">저녁</MenuItem>
                <MenuItem value="full-day">종일</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="날짜"
              type="date"
              value={sessionFormData.date}
              onChange={(e) => setSessionFormData({...sessionFormData, date: e.target.value})}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="시작 시간"
                type="time"
                value={sessionFormData.startTime}
                onChange={(e) => setSessionFormData({...sessionFormData, startTime: e.target.value})}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="종료 시간"
                type="time"
                value={sessionFormData.endTime}
                onChange={(e) => setSessionFormData({...sessionFormData, endTime: e.target.value})}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>
            
            <TextField
              fullWidth
              label="장소"
              value={sessionFormData.location}
              onChange={(e) => setSessionFormData({...sessionFormData, location: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="최대 참가자 수"
              type="number"
              value={sessionFormData.maxParticipants}
              onChange={(e) => setSessionFormData({...sessionFormData, maxParticipants: parseInt(e.target.value)})}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSessionSubmit}
            disabled={!sessionFormData.title || !sessionFormData.date || !sessionFormData.location}
          >
            {editingSession ? '수정' : '생성'}
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

export default BTAdminPage;
