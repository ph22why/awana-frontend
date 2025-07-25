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
  Stack,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import {
  Home,
  Dashboard,
  Group,
  AccessTime,
  School,
  CheckCircle,
  Cancel,
  Refresh
} from '@mui/icons-material';
import { BACKEND_URL } from "../config";

const DashboardPage = () => {
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [levelTestData, setLevelTestData] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const navigate = useNavigate();

  // 학생 대상 시간표 데이터
  const studentScheduleData = {
    "첫째날": [
      { id: "day1_interview", name: "인터뷰", time: "오전" }
    ],
    "둘째날": [
      { id: "day2_qt", name: "QT", time: "아침" },
      { id: "day2_eng1", name: "영어수업 S1", time: "오전" },
      { id: "day2_eng2", name: "영어수업 S2", time: "오전" },
      { id: "day2_eng3", name: "영어수업 S3", time: "오전" },
      { id: "day2_eng4", name: "영어수업 S4", time: "오후" },
      { id: "day2_eng5", name: "영어수업 S5", time: "오후" },
      { id: "day2_lunch", name: "점심식사", time: "점심" },
      { id: "day2_dinner", name: "저녁식사", time: "저녁" },
      { id: "day2_gpp", name: "GPP", time: "저녁" },
      { id: "day2_revival", name: "부흥회", time: "저녁" }
    ],
    "셋째날": [
      { id: "day3_qt", name: "QT", time: "아침" },
      { id: "day3_eng1", name: "영어수업 S1", time: "오전" },
      { id: "day3_eng2", name: "영어수업 S2", time: "오전" },
      { id: "day3_eng3", name: "영어수업 S3", time: "오전" },
      { id: "day3_eng4", name: "영어수업 S4", time: "오후" },
      { id: "day3_eng5", name: "영어수업 S5", time: "오후" },
      { id: "day3_lunch", name: "점심식사", time: "점심" },
      { id: "day3_waterpark", name: "워터파크 입장", time: "오후" },
      { id: "day3_waterpark_exit", name: "워터파크 퇴장", time: "오후" },
      { id: "day3_dinner", name: "저녁식사", time: "저녁" },
      { id: "day3_gpp", name: "GPP", time: "저녁" },
      { id: "day3_revival", name: "부흥회", time: "저녁" }
    ],
    "넷째날": [
      { id: "day4_qt", name: "QT", time: "아침" },
      { id: "day4_eng1", name: "영어수업 S1", time: "오전" },
      { id: "day4_eng2", name: "영어수업 S2", time: "오전" },
      { id: "day4_eng3", name: "영어수업 S3", time: "오전" },
      { id: "day4_eng4", name: "영어수업 S4", time: "오후" },
      { id: "day4_eng5", name: "영어수업 S5", time: "오후" },
      { id: "day4_lunch", name: "점심식사", time: "점심" },
      { id: "day4_dinner", name: "저녁식사", time: "저녁" }
    ],
    "다섯째날": [
      { id: "day5_qt", name: "QT", time: "아침" },
      { id: "day5_eng1", name: "영어수업 S1", time: "오전" },
      { id: "day5_eng2", name: "영어수업 S2", time: "오전" },
      { id: "day5_eng3", name: "영어수업 S3", time: "오전" },
      { id: "day5_eng4", name: "영어수업 S4", time: "오후" },
      { id: "day5_eng5", name: "영어수업 S5", time: "오후" },
      { id: "day5_lunch", name: "점심식사", time: "점심" }
    ]
  };

  // 7그룹 * 5조 = 35개 조 생성
  const groups = Array.from({ length: 7 }, (_, i) => i + 1);
  const teams = Array.from({ length: 5 }, (_, i) => i + 1);

  // 백엔드 그룹명과 매핑
  const groupMapping = {
    1: 'KNOW',
    2: 'LOVE', 
    3: 'SERVE',
    4: 'GLORY',
    5: 'HOLY',
    6: 'GRACE',
    7: 'HOPE'
  };

  const getGroupDisplayName = (groupNumber) => {
    const groupNames = {
      1: 'KNOW',
      2: 'LOVE', 
      3: 'SERVE',
      4: 'GLORY',
      5: 'HOLY',
      6: 'GRACE',
      7: 'HOPE'
    };
    return `${groupNumber}그룹 (${groupNames[groupNumber]})`;
  };

  useEffect(() => {
    if (!isPinVerified) return;
    
    // 기본으로 첫 번째 세션 선택
    const firstSession = Object.values(studentScheduleData)[0]?.[0];
    if (firstSession) {
      setSelectedSession(firstSession);
    }
  }, [isPinVerified]);

  useEffect(() => {
    if (!isPinVerified || !selectedSession) return;
    
    fetchDashboardData();
  }, [isPinVerified, selectedSession]);

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(""), 5000);
  };

  const fetchDashboardData = async () => {
    if (!selectedSession) return;
    
    try {
      setLoading(true);
      
      if (selectedTab === 0) {
        // 출석 현황 조회
        const response = await axios.get(`${BACKEND_URL}/attendance/${selectedSession.id}?userTypes=student`);
        const students = response.data;
        
        // 그룹-조별로 데이터 분류
        const groupedData = {};
        
        groups.forEach(group => {
          teams.forEach(team => {
            const key = `${group}-${team}`;
            const studentsInTeam = students.filter(student => 
              student.studentGroup === groupMapping[group] && student.team === team
            );
            
            groupedData[key] = {
              total: studentsInTeam.length,
              attended: studentsInTeam.filter(s => s.attended).length,
              students: studentsInTeam
            };
          });
        });
        
        setAttendanceData(groupedData);
      } else {
        // 레벨테스트 현황 조회
        const studentsResponse = await axios.get(`${BACKEND_URL}/attendance/session1?userTypes=student`);
        const allStudents = studentsResponse.data;
        
        const levelTestResponse = await axios.get(`${BACKEND_URL}/level-test/completed`);
        const completedStudents = new Set(levelTestResponse.data.map(item => item.student_id));
        
        // 그룹-조별로 데이터 분류
        const groupedData = {};
        
        groups.forEach(group => {
          teams.forEach(team => {
            const key = `${group}-${team}`;
            const studentsInTeam = allStudents.filter(student => 
              student.studentGroup === groupMapping[group] && student.team === team
            );
            
            groupedData[key] = {
              total: studentsInTeam.length,
              completed: studentsInTeam.filter(s => completedStudents.has(s.id)).length,
              students: studentsInTeam
            };
          });
        });
        
        setLevelTestData(groupedData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showAlert("데이터를 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePinSuccess = () => {
    setIsPinVerified(true);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getSessionOptions = () => {
    const options = [];
    Object.entries(studentScheduleData).forEach(([day, sessions]) => {
      sessions.forEach(session => {
        options.push({
          value: session.id,
          label: `${day} - ${session.name} (${session.time})`,
          session: session
        });
      });
    });
    return options;
  };

  const getCompletionRate = (completed, total) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getCardColor = (completed, total) => {
    const rate = getCompletionRate(completed, total);
    if (rate === 100) return 'primary'; // 파란색
    if (rate === 0) return 'error'; // 빨간색
    return 'warning'; // 노란색 (부분 완료)
  };

  const getCardBackground = (completed, total) => {
    const rate = getCompletionRate(completed, total);
    if (rate === 100) return 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'; // 파란색
    if (rate === 0) return 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)'; // 빨간색
    return 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'; // 노란색
  };

  // PIN이 확인되지 않았으면 PIN 입력 다이얼로그만 표시
  if (!isPinVerified) {
    return (
      <PinAuthDialog
        open={true}
        onClose={() => navigate('/')}
        onSuccess={handlePinSuccess}
        requiredPin="1234"
        title="대시보드 접근 인증"
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
            <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
            학생 그룹-조별 현황 대시보드
          </Typography>
          <Button
            color="inherit"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
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

      {/* Tabs and Controls */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab 
              icon={<AccessTime />} 
              label="출석 현황" 
              iconPosition="start"
            />
            <Tab 
              icon={<School />} 
              label="레벨테스트 현황" 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {selectedTab === 0 && (
          <Box sx={{ p: 3 }}>
            <FormControl fullWidth>
              <InputLabel>시간표 선택</InputLabel>
              <Select
                value={selectedSession?.id || ''}
                label="시간표 선택"
                onChange={(e) => {
                  const option = getSessionOptions().find(opt => opt.value === e.target.value);
                  if (option) {
                    setSelectedSession(option.session);
                  }
                }}
              >
                {getSessionOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>

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
                  const data = selectedTab === 0 ? attendanceData[key] : levelTestData[key];
                  const completed = selectedTab === 0 ? data?.attended || 0 : data?.completed || 0;
                  const total = data?.total || 0;
                  const rate = getCompletionRate(completed, total);
                  
                  return (
                    <Grid item xs={12} sm={6} md={2.4} key={team}>
                      <Card 
                        sx={{ 
                          background: getCardBackground(completed, total),
                          color: 'white',
                          minHeight: 120
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h6" gutterBottom fontWeight="bold">
                            {team}조
                          </Typography>
                          <Typography variant="h4" sx={{ mb: 1 }}>
                            {completed}/{total}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {Math.round(rate)}% 완료
                          </Typography>
                          
                          {rate === 100 ? (
                            <Chip 
                              icon={<CheckCircle />}
                              label="완료" 
                              size="small" 
                              sx={{ 
                                mt: 1, 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white'
                              }}
                            />
                          ) : rate === 0 ? (
                            <Chip 
                              icon={<Cancel />}
                              label="미완료" 
                              size="small" 
                              sx={{ 
                                mt: 1, 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white'
                              }}
                            />
                          ) : (
                            <Chip 
                              label="진행중" 
                              size="small" 
                              sx={{ 
                                mt: 1, 
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

      {/* Summary */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          전체 현황 요약
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              총 조 수
            </Typography>
            <Typography variant="h4">
              35개 조
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              완료된 조
            </Typography>
            <Typography variant="h4">
              {selectedTab === 0 
                ? Object.values(attendanceData).filter(data => data.total > 0 && data.attended === data.total).length
                : Object.values(levelTestData).filter(data => data.total > 0 && data.completed === data.total).length
              }개 조
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              전체 완료율
            </Typography>
            <Typography variant="h4">
              {(() => {
                const data = selectedTab === 0 ? attendanceData : levelTestData;
                const totalStudents = Object.values(data).reduce((sum, item) => sum + (item.total || 0), 0);
                const completedStudents = Object.values(data).reduce((sum, item) => 
                  sum + (selectedTab === 0 ? (item.attended || 0) : (item.completed || 0)), 0);
                return totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;
              })()}%
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DashboardPage; 