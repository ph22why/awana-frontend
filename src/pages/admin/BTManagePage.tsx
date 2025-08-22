import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Receipt as ReceiptIcon,
  Refresh,
  People,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { btApi, ChurchManager, BTReceipt } from '../../services/api/btApi';



const BTManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [churchManagers, setChurchManagers] = useState<ChurchManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedManager, setSelectedManager] = useState<ChurchManager | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalData, setApprovalData] = useState({
    eventId: '',
    costs: '',
    partTeacher: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchChurchManagers();
  }, []);

  const fetchChurchManagers = async () => {
    setLoading(true);
    try {
      const response = await btApi.getChurchManagers();
      setChurchManagers(response.data);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'BT 신청 목록을 불러오는데 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (managerId: string, status: string) => {
    try {
      if (status === 'approved') {
        await btApi.updateChurchManagerStatus(
          managerId,
          status,
          approvalData.eventId,
          parseInt(approvalData.costs),
          parseInt(approvalData.partTeacher)
        );
      } else {
        await btApi.updateChurchManagerStatus(managerId, status);
      }

      setSnackbar({
        open: true,
        message: `상태가 ${status === 'approved' ? '승인' : '거절'}으로 변경되었습니다.`,
        severity: 'success',
      });
      
      // 목록 새로고침
      fetchChurchManagers();
      
      // 다이얼로그 닫기
      setApprovalDialog(false);
      setSelectedManager(null);
      setApprovalData({ eventId: '', costs: '', partTeacher: '' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || '상태 업데이트에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  const openApprovalDialog = (manager: ChurchManager) => {
    setSelectedManager(manager);
    setApprovalData({
      eventId: '',
      costs: '',
      partTeacher: manager.participants?.toString() || '1',
    });
    setApprovalDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '승인됨';
      case 'rejected': return '거절됨';
      default: return '대기중';
    }
  };

  const handleViewReceipt = async (managerId: string) => {
    try {
      const receipts = await btApi.getBTReceiptByChurchManager(managerId);
      
      if (receipts.length > 0) {
        const receipt = receipts[0]; // 첫 번째 영수증
        // receipt-service의 영수증 구조에 맞게 수정
        const receiptInfo = `
영수증 정보:
- 이벤트: ${receipt.eventId}
- 교회: ${receipt.churchName} (${receipt.churchId.mainId}-${receipt.churchId.subId})
- 담당자: ${receipt.managerName}
- 참가 교사 수: ${receipt.partTeacher}명
- 금액: ${receipt.costs.toLocaleString()}원
- 결제 상태: ${receipt.paymentStatus}
- 발급일: ${new Date(receipt.createdAt).toLocaleDateString('ko-KR')}
        `.trim();
        
        alert(receiptInfo);
      } else {
        alert('영수증이 아직 발급되지 않았습니다.');
      }
    } catch (error: any) {
      console.error('영수증 조회 오류:', error);
      setSnackbar({
        open: true,
        message: '영수증 조회 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const handleManageTeachers = (churchManagerId: string) => {
    // 교사 관리 페이지로 이동하거나 다이얼로그 표시
    navigate(`/admin/bt-teachers/${churchManagerId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          BT 신청 관리
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchChurchManagers}
            sx={{ mr: 2 }}
          >
            새로고침
          </Button>
          <Button onClick={() => navigate('/admin')} variant="outlined">
            뒤로 가기
          </Button>
        </Box>
      </Box>

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                전체 신청
              </Typography>
              <Typography variant="h4">
                {churchManagers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                대기중
              </Typography>
              <Typography variant="h4">
                {churchManagers.filter(cm => cm.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                승인됨
              </Typography>
              <Typography variant="h4">
                {churchManagers.filter(cm => cm.status === 'approved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 신청 목록 테이블 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>교회명</TableCell>
                <TableCell>담당자</TableCell>
                <TableCell>연락처</TableCell>
                <TableCell>예상 참가자</TableCell>
                <TableCell>신청일</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {churchManagers.map((manager) => (
                <TableRow key={manager._id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {manager.churchName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {manager.churchAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {manager.managerName}
                    </Typography>
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
                              onClick={() => handleStatusUpdate(manager._id, 'rejected')}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {manager.status === 'approved' && (
                        <>
                          <Tooltip title="영수증 보기">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewReceipt(manager._id)}
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="교사 관리">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleManageTeachers(manager._id)}
                            >
                              <People />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
                승인 시 자동으로 영수증이 발급됩니다.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={() => selectedManager && handleStatusUpdate(selectedManager._id, 'approved')}
            disabled={!approvalData.eventId || !approvalData.costs || !approvalData.partTeacher}
          >
            승인
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

export default BTManagePage;
