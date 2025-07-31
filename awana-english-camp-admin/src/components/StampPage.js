import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PinAuthDialog from './PinAuthDialog';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Toolbar,
  AppBar,
  IconButton,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider
} from '@mui/material';
import {
  Home,
  EmojiEvents,
  Group,
  Refresh,
  Close,
  Person,
  Save,
  Star
} from '@mui/icons-material';
import { BACKEND_URL } from "../config";

const StampPage = () => {
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [studentsData, setStudentsData] = useState({});
  const [stampsData, setStampsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [studentDialog, setStudentDialog] = useState(false);
  const [selectedTeamData, setSelectedTeamData] = useState(null);
  const [editingStamps, setEditingStamps] = useState({});
  const navigate = useNavigate();

  // 7그룹 * 5조 = 35개 조 생성
  const groups = ['KNOW', 'LOVE', 'SERVE', 'GLORY', 'HOLY', 'GRACE', 'HOPE'];
  const teams = Array.from({ length: 5 }, (_, i) => i + 1);

  const getGroupDisplayName = (groupName) => {
    const groupNumbers = {
      'KNOW': 1,
      'LOVE': 2, 
      'SERVE': 3,
      'GLORY': 4,
      'HOLY': 5,
      'GRACE': 6,
      'HOPE': 7
    };
    const groupNumber = groupNumbers[groupName] || 0;
    return `${groupNumber}그룹 (${groupName})`;
  };

  useEffect(() => {
    if (isPinVerified) {
      fetchData();
    }
  }, [isPinVerified]);

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(""), 5000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 학생 데이터 조회
      console.log('📋 Fetching students data...');
      const studentsResponse = await axios.get(`${BACKEND_URL}/attendance/session1?userTypes=student`);
      const allStudents = studentsResponse.data || [];
      
      console.log(`✅ Found ${allStudents.length} total students`);

      // 스탬프 데이터 조회
      console.log('🏆 Fetching stamps data...');
      const stampsResponse = await axios.get(`${BACKEND_URL}/stamps/all`);
      const allStamps = stampsResponse.data || [];
      
      console.log(`✅ Found ${allStamps.length} stamp records`);

      // 스탬프 데이터를 student_id로 매핑
      const stampsMap = {};
      allStamps.forEach(stamp => {
        stampsMap[stamp.student_id] = stamp;
      });

      // 그룹-조별로 학생 데이터 분류
      const groupedStudents = {};
      const groupedStamps = {};

      groups.forEach(group => {
        teams.forEach(team => {
          const key = `${group}-${team}`;
          const studentsInTeam = allStudents.filter(student => 
            student.studentGroup === group && student.team === team
          );
          
          // 학생별 스탬프 정보 추가
          const studentsWithStamps = studentsInTeam.map(student => ({
            ...student,
            stampData: stampsMap[student.id] || {
              stamp_count: 0,
              korean_pin_complete: false,
              english_pin_complete: false,
              total_score: 0
            }
          }));

          groupedStudents[key] = {
            total: studentsInTeam.length,
            students: studentsWithStamps
          };

          // 스탬프 통계 계산
          const stampStats = {
            totalStamps: studentsWithStamps.reduce((sum, s) => sum + (s.stampData.stamp_count || 0), 0),
            koreanComplete: studentsWithStamps.filter(s => s.stampData.korean_pin_complete).length,
            englishComplete: studentsWithStamps.filter(s => s.stampData.english_pin_complete).length,
            averageScore: studentsWithStamps.length > 0 
              ? (studentsWithStamps.reduce((sum, s) => sum + (s.stampData.total_score || 0), 0) / studentsWithStamps.length).toFixed(1)
              : 0
          };

          groupedStamps[key] = stampStats;
        });
      });

      setStudentsData(groupedStudents);
      setStampsData(groupedStamps);
      console.log('📊 Data grouped successfully');

    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert(`데이터를 불러오는데 실패했습니다: ${error.message}`, "error");
      setStudentsData({});
      setStampsData({});
    } finally {
      setLoading(false);
    }
  };

  const handlePinSuccess = () => {
    setIsPinVerified(true);
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh requested');
    fetchData();
  };

  const handleTeamClick = (group, team, data) => {
    if (!data || data.total === 0) return;
    
    setSelectedTeamData({
      group,
      team,
      data,
      title: `${getGroupDisplayName(group)} ${team}조 스탬프 관리`
    });
    
    // 편집 상태 초기화
    const initialEditState = {};
    data.students.forEach(student => {
      initialEditState[student.id] = {
        stamp_count: student.stampData.stamp_count || 0,
        korean_pin_complete: student.stampData.korean_pin_complete || false,
        english_pin_complete: student.stampData.english_pin_complete || false
      };
    });
    setEditingStamps(initialEditState);
    setStudentDialog(true);
  };

  const handleCloseStudentDialog = () => {
    setStudentDialog(false);
    setSelectedTeamData(null);
    setEditingStamps({});
  };

  const handleStampChange = (studentId, field, value) => {
    setEditingStamps(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveStamps = async () => {
    if (!selectedTeamData) return;

    try {
      setLoading(true);
      const updates = [];

      // 변경된 데이터만 수집
      selectedTeamData.data.students.forEach(student => {
        const currentData = editingStamps[student.id];
        const originalData = student.stampData;
        
        if (currentData && (
          currentData.stamp_count !== originalData.stamp_count ||
          currentData.korean_pin_complete !== originalData.korean_pin_complete ||
          currentData.english_pin_complete !== originalData.english_pin_complete
        )) {
          updates.push({
            student_id: student.id,
            ...currentData
          });
        }
      });

      if (updates.length === 0) {
        showAlert("변경된 내용이 없습니다.", "info");
        return;
      }

      console.log(`💾 Saving ${updates.length} stamp updates...`);
      
      // 배치 업데이트 API 호출
      const response = await axios.post(`${BACKEND_URL}/stamps/batch-update`, {
        updates
      });

      if (response.data.success) {
        showAlert(`${updates.length}명의 스탬프 정보가 저장되었습니다.`, "success");
        handleCloseStudentDialog();
        fetchData(); // 데이터 새로고침
      } else {
        showAlert("저장 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      console.error("Error saving stamps:", error);
      showAlert(`저장 실패: ${error.response?.data?.error || error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const getCardColor = (stampStats) => {
    if (!stampStats) return 'grey';
    const avgScore = parseFloat(stampStats.averageScore || 0);
    if (avgScore >= 15) return '#4caf50'; // 초록색
    if (avgScore >= 10) return '#2196f3'; // 파란색  
    if (avgScore >= 5) return '#ff9800'; // 주황색
    return '#f44336'; // 빨간색
  };

  const getCardBackground = (stampStats) => {
    if (!stampStats) return 'linear-gradient(135deg, #9e9e9e 0%, #616161 100%)';
    const avgScore = parseFloat(stampStats.averageScore || 0);
    if (avgScore >= 15) return 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)';
    if (avgScore >= 10) return 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)';
    if (avgScore >= 5) return 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)';
    return 'linear-gradient(135deg, #f44336 0%, #e57373 100%)';
  };

  // PIN이 확인되지 않았으면 PIN 입력 다이얼로그만 표시
  if (!isPinVerified) {
    return (
      <PinAuthDialog
        open={true}
        onClose={() => navigate('/')}
        onSuccess={handlePinSuccess}
        requiredPin="1234"
        title="스탬프 관리 접근 인증"
      />
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
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
            <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
            학생 스탬프 관리 시스템
          </Typography>
          <Button
            color="inherit"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            새로고침
          </Button>
        </Toolbar>
      </AppBar>

      {/* Alert */}
      {alertMessage && (
        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Dashboard Grid */}
      <Grid container spacing={2}>
        {groups.map(group => (
          <Grid item xs={12} key={group}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                {getGroupDisplayName(group)}
              </Typography>
              <Grid container spacing={2}>
                {teams.map(team => {
                  const key = `${group}-${team}`;
                  const studentData = studentsData[key];
                  const stampStats = stampsData[key];
                  const total = studentData?.total || 0;
                  
                  return (
                    <Grid item xs={12} sm={6} md={2.4} key={team}>
                      <Card 
                        sx={{ 
                          background: getCardBackground(stampStats),
                          color: 'white',
                          minHeight: 140,
                          cursor: studentData && total > 0 ? 'pointer' : 'default',
                          transition: 'transform 0.2s',
                          '&:hover': studentData && total > 0 ? {
                            transform: 'scale(1.02)'
                          } : {}
                        }}
                        onClick={() => handleTeamClick(group, team, studentData)}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h6" gutterBottom fontWeight="bold">
                            {team}조
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            학생: {total}명
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            총 스탬프: {stampStats?.totalStamps || 0}개
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1, fontSize: '0.75rem' }}>
                            한글: {stampStats?.koreanComplete || 0}명 / 영어: {stampStats?.englishComplete || 0}명
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            평균: {stampStats?.averageScore || 0}점
                          </Typography>
                          
                          <Chip 
                            icon={<Star />}
                            label={`평균 ${stampStats?.averageScore || 0}점`}
                            size="small" 
                            sx={{ 
                              mt: 1, 
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'white'
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Summary */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          전체 스탬프 현황 요약
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              총 학생 수
            </Typography>
            <Typography variant="h4">
              {Object.values(studentsData).reduce((sum, data) => sum + (data?.total || 0), 0)}명
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              총 스탬프 개수
            </Typography>
            <Typography variant="h4">
              {Object.values(stampsData).reduce((sum, data) => sum + (data?.totalStamps || 0), 0)}개
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              한글 완성자
            </Typography>
            <Typography variant="h4">
              {Object.values(stampsData).reduce((sum, data) => sum + (data?.koreanComplete || 0), 0)}명
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              영어 완성자
            </Typography>
            <Typography variant="h4">
              {Object.values(stampsData).reduce((sum, data) => sum + (data?.englishComplete || 0), 0)}명
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Student Detail Dialog */}
      <Dialog
        open={studentDialog}
        onClose={handleCloseStudentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" />
          {selectedTeamData && selectedTeamData.title}
          <IconButton
            onClick={handleCloseStudentDialog}
            sx={{ ml: 'auto' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedTeamData && (
            <Box>
              <Paper elevation={1}>
                <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Group />
                    학생 스탬프 관리 ({selectedTeamData.data.total}명)
                  </Typography>
                </Box>
                
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>이름</TableCell>
                        <TableCell>교회</TableCell>
                        <TableCell align="center">스탬프 개수</TableCell>
                        <TableCell align="center">한글완성</TableCell>
                        <TableCell align="center">영어완성</TableCell>
                        <TableCell align="center">예상점수</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTeamData.data.students.map((student) => {
                        const editData = editingStamps[student.id] || {};
                        const calculatedScore = (editData.stamp_count || 0) + 
                                              (editData.korean_pin_complete ? 10 : 0) + 
                                              (editData.english_pin_complete ? 5 : 0);
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {student.name || student.koreanName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {student.englishName || '-'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {student.churchName || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={editData.stamp_count || 0}
                                onChange={(e) => handleStampChange(student.id, 'stamp_count', parseInt(e.target.value) || 0)}
                                inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={editData.korean_pin_complete || false}
                                    onChange={(e) => handleStampChange(student.id, 'korean_pin_complete', e.target.checked)}
                                    size="small"
                                  />
                                }
                                label=""
                                sx={{ m: 0 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={editData.english_pin_complete || false}
                                    onChange={(e) => handleStampChange(student.id, 'english_pin_complete', e.target.checked)}
                                    size="small"
                                  />
                                }
                                label=""
                                sx={{ m: 0 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                {calculatedScore}점
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseStudentDialog}>
            취소
          </Button>
          <Button 
            onClick={handleSaveStamps} 
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StampPage; 