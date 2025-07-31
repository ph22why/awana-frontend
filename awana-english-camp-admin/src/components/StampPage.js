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
  Save
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
      let allStamps = stampsResponse.data || [];
      
      // 데이터 구조 확인 및 디버깅
      console.log('🔍 Stamps response structure:', stampsResponse.data);
      console.log('🔍 Type of stamps data:', typeof stampsResponse.data);
      console.log('🔍 Is array:', Array.isArray(stampsResponse.data));
      
      // 만약 data가 객체이고 배열이 아니라면 적절히 처리
      if (stampsResponse.data && typeof stampsResponse.data === 'object' && !Array.isArray(stampsResponse.data)) {
        // 객체의 값들이 배열인 경우 (예: { data: [...] })
        if (stampsResponse.data.data && Array.isArray(stampsResponse.data.data)) {
          allStamps = stampsResponse.data.data;
        } else if (stampsResponse.data.results && Array.isArray(stampsResponse.data.results)) {
          allStamps = stampsResponse.data.results;
        } else {
          // 객체의 값들을 배열로 변환
          allStamps = Object.values(stampsResponse.data);
        }
      }
      
      // 최종 확인
      if (!Array.isArray(allStamps)) {
        console.error('❌ Stamps data is not an array:', allStamps);
        allStamps = [];
      }
      
      console.log(`✅ Found ${allStamps.length} stamp records`);

      // 스탬프 데이터를 student_id로 매핑
      const stampsMap = {};
      allStamps.forEach(stamp => {
        if (stamp && stamp.student_id) {
          stampsMap[stamp.student_id] = stamp;
        }
      });
      
      console.log('🔗 Sample stamp mapping:', Object.keys(stampsMap).slice(0, 5));
      console.log('🔗 Total stamp mappings:', Object.keys(stampsMap).length);
      
      // 학생 데이터 샘플 확인
      if (allStudents.length > 0) {
        console.log('👤 Sample student data:', allStudents[0]);
        console.log('👤 Student ID type:', typeof allStudents[0].id);
        const sampleStudentId = allStudents[0].id;
        console.log('🔗 Sample student has stamp data:', !!stampsMap[sampleStudentId]);
      }

      // 그룹-조별로 학생 데이터 분류
      const groupedStudents = {};
      const groupedStamps = {};

      // 그룹별 학생 분포 확인
      const groupDistribution = {};
      allStudents.forEach(student => {
        const group = student.studentGroup || 'undefined';
        const team = student.team || 'undefined';
        const key = `${group}-${team}`;
        groupDistribution[key] = (groupDistribution[key] || 0) + 1;
      });
      console.log('📊 Student distribution by group-team:', groupDistribution);

      groups.forEach(group => {
        teams.forEach(team => {
          const key = `${group}-${team}`;
          const studentsInTeam = allStudents.filter(student => 
            student.studentGroup === group && student.team === team
          );
          
          if (studentsInTeam.length > 0) {
            console.log(`👥 ${key}: Found ${studentsInTeam.length} students`);
            // 첫 번째 학생의 스탬프 데이터 확인
            const firstStudent = studentsInTeam[0];
            const hasStampData = !!stampsMap[firstStudent.id];
            console.log(`   📋 First student (${firstStudent.name || firstStudent.koreanName}) has stamp data: ${hasStampData}`);
            if (hasStampData) {
              console.log(`   📋 Stamp data:`, stampsMap[firstStudent.id]);
            }
          }
          
          // 학생별 스탬프 정보 추가
          const studentsWithStamps = studentsInTeam.map(student => {
            const stampData = stampsMap[student.id] || {
              stamp_count: 0,
              korean_pin_complete: false,
              english_pin_complete: false,
              total_score: 0
            };
            
            return {
              ...student,
              stampData: stampData
            };
          });

          groupedStudents[key] = {
            total: studentsInTeam.length,
            students: studentsWithStamps
          };

          // 간단한 통계만 (학생 수)
          const stampStats = {
            studentCount: studentsWithStamps.length,
            hasStudents: studentsWithStamps.length > 0
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

  const getCardBackground = (stampStats, hasStudents) => {
    if (!hasStudents) {
      return 'linear-gradient(135deg, #9e9e9e 0%, #616161 100%)'; // 회색 - 학생 없음
    }
    // 모든 조에 동일한 색상 (파란색)
    return 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)';
  };

  // PIN이 확인되지 않았으면 PIN 입력 다이얼로그만 표시
  if (!isPinVerified) {
    return (
      <PinAuthDialog
        open={true}
        onClose={() => navigate('/')}
        onSuccess={handlePinSuccess}
        requiredPin="1234"
        title="스탬프 입력 접근 인증"
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
            스탬프 입력 시스템 (조별 선생님용)
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
                          background: getCardBackground(stampStats, total > 0),
                          color: 'white',
                          minHeight: 120,
                          cursor: studentData && total > 0 ? 'pointer' : 'default',
                          transition: 'transform 0.2s',
                          opacity: total > 0 ? 1 : 0.6,
                          '&:hover': studentData && total > 0 ? {
                            transform: 'scale(1.05)',
                            boxShadow: 3
                          } : {}
                        }}
                        onClick={() => handleTeamClick(group, team, studentData)}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Typography variant="h4" gutterBottom fontWeight="bold">
                            {team}조
                          </Typography>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            {total}명
                          </Typography>
                          
                          {total > 0 ? (
                            <Chip 
                              label="스탬프 입력하기"
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          ) : (
                            <Chip 
                              label="학생 없음"
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white'
                              }}
                            />
                          )}
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

      {/* 간단한 안내 메시지 */}
      <Paper elevation={2} sx={{ p: 2, mt: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          📝 담당하시는 조를 선택하여 학생들의 스탬프 정보를 입력해주세요
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          스탬프 개수, 도전암송핀 한글완성, 영어완성 여부를 체크할 수 있습니다
        </Typography>
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
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Group />
                    학생 스탬프 입력 ({selectedTeamData.data.total}명)
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    💡 점수 계산: 스탬프 1개 = 1점, 한글완성 = 10점, 영어완성 = 5점
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
                        <TableCell align="center">계산점수</TableCell>
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