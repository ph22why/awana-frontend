import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from '@zxing/library';
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
  Stack,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  FormControlLabel,
  useMediaQuery,
  useTheme,
  CircularProgress,
  LinearProgress,
  Backdrop
} from '@mui/material';
import {
  Home,
  QrCodeScanner,
  Close,
  Check,
  Person,
  AccessTime,
  CalendarToday,
  CameraAlt,
  PhoneAndroid,
  Computer
} from '@mui/icons-material';
import { BACKEND_URL } from "../config";

const AttendancePage = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [scannerDialog, setScannerDialog] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [useCameraScanner, setUseCameraScanner] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanBuffer, setScanBuffer] = useState("");
  const [scanTimeStamp, setScanTimeStamp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAbsentOnly, setShowAbsentOnly] = useState(false);
  const webcamRef = useRef(null);
  const codeReader = useRef(null);
  const barcodeInputRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 시간표 데이터 - 세션 타입에 따른 사용자 필터링
  const scheduleData = {
    "첫째날": [
      { id: "day1_interview", name: "인터뷰", time: "오전", type: "special", userTypes: ["student"] },
      { id: "day1_dinner", name: "저녁식사", time: "저녁", type: "meal", userTypes: ["student", "ym", "teacher", "staff"] }
    ],
    "둘째날": [
      { id: "day2_qt", name: "QT", time: "아침", type: "activity", userTypes: ["student"] },
      { id: "day2_eng1", name: "영어수업 S1", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day2_eng2", name: "영어수업 S2", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day2_eng3", name: "영어수업 S3", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day2_eng4", name: "영어수업 S4", time: "오후", type: "class", userTypes: ["student"] },
      { id: "day2_eng5", name: "영어수업 S5", time: "오후", type: "class", userTypes: ["student"] },
      { id: "day2_lunch", name: "점심식사", time: "점심", type: "meal", userTypes: ["student", "ym", "teacher", "staff"] },
      { id: "day2_dinner", name: "저녁식사", time: "저녁", type: "meal", userTypes: ["student", "ym", "teacher", "staff"] }
    ],
    "셋째날": [
      { id: "day3_qt", name: "QT", time: "아침", type: "activity", userTypes: ["student"] },
      { id: "day3_eng1", name: "영어수업 S1", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day3_eng2", name: "영어수업 S2", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day3_eng3", name: "영어수업 S3", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day3_eng4", name: "영어수업 S4", time: "오후", type: "class", userTypes: ["student"] },
      { id: "day3_eng5", name: "영어수업 S5", time: "오후", type: "class", userTypes: ["student"] },
      { id: "day3_lunch", name: "점심식사", time: "점심", type: "meal", userTypes: ["student", "ym", "teacher", "staff"] },
      { id: "day3_waterpark", name: "워터파크 입장", time: "오후", type: "special", userTypes: ["student", "ym", "teacher", "staff"] },
      { id: "day3_waterpark_exit", name: "워터파크 퇴장", time: "오후", type: "special", userTypes: ["student", "ym", "teacher", "staff"] },
      { id: "day3_dinner", name: "저녁식사", time: "저녁", type: "meal", userTypes: ["student", "ym", "teacher", "staff"] }
    ],
    "넷째날": [
      { id: "day4_qt", name: "QT", time: "아침", type: "activity", userTypes: ["student"] },
      { id: "day4_eng1", name: "영어수업 S1", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day4_eng2", name: "영어수업 S2", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day4_eng3", name: "영어수업 S3", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day4_eng4", name: "영어수업 S4", time: "오후", type: "class", userTypes: ["student"] },
      { id: "day4_eng5", name: "영어수업 S5", time: "오후", type: "class", userTypes: ["student"] },
      { id: "day4_lunch", name: "점심식사", time: "점심", type: "meal", userTypes: ["student", "ym", "teacher", "staff"] },
      { id: "day4_dinner", name: "저녁식사", time: "저녁", type: "meal", userTypes: ["student", "ym", "teacher", "staff"] }
    ],
    "다섯째날": [
      { id: "day5_qt", name: "QT", time: "아침", type: "activity", userTypes: ["student"] },
      { id: "day5_eng1", name: "영어수업 S1", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day5_eng2", name: "영어수업 S2", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day5_eng3", name: "영어수업 S3", time: "오전", type: "class", userTypes: ["student"] },
      { id: "day5_eng4", name: "영어수업 S4", time: "오후", type: "class", userTypes: ["student"] },
      { id: "day5_eng5", name: "영어수업 S5", time: "오후", type: "class", userTypes: ["student"] },
      { id: "day5_lunch", name: "점심식사", time: "점심", type: "meal", userTypes: ["student", "ym", "teacher", "staff"] }
    ]
  };

  useEffect(() => {
    if (useCameraScanner && scannerDialog) {
      startCameraScanner();
    }
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [useCameraScanner, scannerDialog]);

  // PC 바코드 스캐너를 위한 키보드 이벤트 리스너
  useEffect(() => {
    if (!isMobile && attendanceDialog) {
      const handleKeyPress = (event) => {
        // 입력 필드에 포커스가 있을 때만 처리
        if (barcodeInputRef.current && document.activeElement === barcodeInputRef.current) {
          const currentTime = Date.now();
          
          // 빠른 연속 입력 감지 (바코드 스캐너 특성)
          if (currentTime - scanTimeStamp > 100) {
            setScanBuffer("");
          }
          
          setScanTimeStamp(currentTime);
          
          if (event.key === 'Enter') {
            // 엔터키가 눌리면 스캔 완료로 처리
            if (scanBuffer.length > 0) {
              setBarcodeInput(scanBuffer);
              setScanBuffer("");
              // 자동으로 출석 처리
              setTimeout(() => {
                handleBarcodeSubmit();
              }, 100);
            }
          } else if (event.key.length === 1) {
            // 일반 문자 입력
            setScanBuffer(prev => prev + event.key);
            
            // 타이머 설정 - 500ms 후에 스캔 완료로 간주
            if (scanTimeoutRef.current) {
              clearTimeout(scanTimeoutRef.current);
            }
            
            scanTimeoutRef.current = setTimeout(() => {
              if (scanBuffer.length > 3) { // 최소 길이 체크
                setBarcodeInput(scanBuffer);
                setScanBuffer("");
                // 자동으로 출석 처리
                setTimeout(() => {
                  handleBarcodeSubmit();
                }, 100);
              }
            }, 500);
          }
        }
      };

      document.addEventListener('keypress', handleKeyPress);
      
      return () => {
        document.removeEventListener('keypress', handleKeyPress);
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }
      };
    }
  }, [isMobile, attendanceDialog, scanBuffer, scanTimeStamp]);

  // 출석 다이얼로그가 열릴 때 입력 필드에 자동 포커스 (안전하게)
  useEffect(() => {
    if (attendanceDialog && !isMobile) {
      setTimeout(() => {
        try {
          barcodeInputRef.current?.focus();
        } catch (err) {
          console.warn("Focus error (safely handled):", err);
        }
      }, 300);
    }
  }, [attendanceDialog, isMobile]);

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(""), 5000);
  };

  const getSessionColor = (session) => {
    // 워터파크 관련 세션은 특별히 구분
    if (session.id.includes('waterpark')) {
      return session.name.includes('입장') ? 'info' : 'secondary';
    }
    
    switch (session.type) {
      case "class": return "primary";
      case "meal": return "warning";
      case "activity": return "success";
      case "special": return "error";
      default: return "default";
    }
  };

  const handleSessionClick = async (session, day) => {
    setSelectedSession({ ...session, day });
    setShowAbsentOnly(false); // 새 세션 선택 시 필터링 초기화
    setAttendanceDialog(true);
    await fetchAttendanceData(session.id, session.userTypes);
  };

  const fetchAttendanceData = async (sessionId, allowedUserTypes = ["student", "ym", "teacher", "staff"]) => {
    try {
      setLoading(true);
      
      // 백엔드에 사용자 타입을 쿼리 매개변수로 전달
      const userTypesParam = allowedUserTypes.join(',');
      const response = await axios.get(`${BACKEND_URL}/attendance/${sessionId}?userTypes=${userTypesParam}`);
      
      setAttendanceList(response.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceList([]);
      showAlert("출석 데이터 로드 중 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSubmit = async () => {
    if (!barcodeInput.trim()) {
      showAlert("바코드를 입력해주세요.", "error");
      return;
    }

    if (submitting) return; // 중복 제출 방지

    try {
      setSubmitting(true);
      
      // 명확한 로딩 표시
      const startTime = Date.now();
      console.log(`🔄 Starting attendance check at ${new Date().toLocaleTimeString()}`);
      
      const response = await axios.post(`${BACKEND_URL}/attendance/check`, {
        sessionId: selectedSession.id,
        studentId: barcodeInput.trim()
      });
      
      const endTime = Date.now();
      console.log(`✅ Attendance check completed in ${endTime - startTime}ms`);

      if (response.data.success) {
        showAlert(`✅ ${response.data.userName} 출석 완료!`, "success");
        setBarcodeInput("");
        setScanBuffer(""); // 스캔 버퍼 초기화
        
        // 🚀 성능 최적화: 전체 재조회 대신 로컬 상태만 업데이트
        setAttendanceList(prevList => 
          prevList.map(user => {
            // 내부 ID로 정확하게 매칭
            const userMatches = user.user_type === response.data.userType && 
                               user.id == response.data.internalId;
            
            return userMatches 
              ? { ...user, attended: true, attendedAt: response.data.attendedAt }
              : user;
          })
        );
        
        // PC에서는 다시 입력 필드에 포커스 (안전하게)
        if (!isMobile && barcodeInputRef.current) {
          setTimeout(() => {
            try {
              barcodeInputRef.current?.focus();
            } catch (err) {
              console.warn("Focus error (safely handled):", err);
            }
          }, 100);
        }
      } else {
        showAlert(response.data.message || "출석 처리 실패", "error");
        setBarcodeInput("");
        setScanBuffer(""); // 스캔 버퍼 초기화
        
        // 실패해도 포커스 복원 (안전하게)
        if (!isMobile && barcodeInputRef.current) {
          setTimeout(() => {
            try {
              barcodeInputRef.current?.focus();
            } catch (err) {
              console.warn("Focus error (safely handled):", err);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
      showAlert("❌ 출석 처리 중 오류가 발생했습니다.", "error");
      setBarcodeInput("");
      setScanBuffer(""); // 스캔 버퍼 초기화
      
      // 오류 시에도 포커스 복원 (안전하게)
      if (!isMobile && barcodeInputRef.current) {
        setTimeout(() => {
          try {
            barcodeInputRef.current?.focus();
          } catch (err) {
            console.warn("Focus error (safely handled):", err);
          }
        }, 100);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 사용자 타입별 한국어 변환
  const getKoreanUserType = (userType) => {
    switch (userType) {
      case 'student': return '학생';
      case 'ym': return 'YM';
      case 'teacher': return '교사';
      case 'staff': return '스태프';
      default: return '사용자';
    }
  };

  // 사용자 타입별 색상
  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'student': return 'primary';
      case 'ym': return 'success';
      case 'teacher': return 'warning';
      case 'staff': return 'error';
      default: return 'default';
    }
  };

  const startCameraScanner = async () => {
    try {
      setCameraError("");
      codeReader.current = new BrowserMultiFormatReader();
      
      if (isMobile) {
        // 모바일에서는 webcam 사용
        startWebcamScanner();
      } else {
        // PC에서는 연결된 스캐너 사용
        const videoInputDevices = await codeReader.current.listVideoInputDevices();
        
        if (videoInputDevices.length > 0) {
          codeReader.current.decodeFromVideoDevice(
            videoInputDevices[0].deviceId,
            'video',
            (result, err) => {
              if (result) {
                setBarcodeInput(result.getText());
                setScannerDialog(false);
                setUseCameraScanner(false);
                codeReader.current.reset();
              }
            }
          );
        } else {
          setCameraError("스캐너가 연결되지 않았습니다. USB 스캐너를 연결해주세요.");
        }
      }
    } catch (error) {
      console.error("Scanner error:", error);
      setCameraError("스캐너를 시작할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  const startWebcamScanner = () => {
    const scanInterval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc && codeReader.current) {
          codeReader.current.decodeFromImage(undefined, imageSrc)
            .then((result) => {
              if (result) {
                setBarcodeInput(result.text);
                setScannerDialog(false);
                setUseCameraScanner(false);
                clearInterval(scanInterval);
                if (codeReader.current) {
                  codeReader.current.reset();
                }
              }
            })
            .catch((err) => {
              // QR 코드가 감지되지 않을 때는 에러를 무시
            });
        }
      }
    }, 100);

    // 30초 후 자동 정지
    setTimeout(() => {
      clearInterval(scanInterval);
    }, 30000);
  };

  const handleTitleClick = () => {
    navigate("/");
  };

  const handleCloseAttendanceDialog = () => {
    setAttendanceDialog(false);
    setSelectedSession(null);
    setAttendanceList([]);
    setShowAbsentOnly(false); // 다이얼로그 닫을 때 필터링 초기화
  };

  const handleCloseScannerDialog = () => {
    setScannerDialog(false);
    setUseCameraScanner(false);
    setCameraError("");
    if (codeReader.current) {
      codeReader.current.reset();
    }
  };

  const openScannerDialog = () => {
    setScannerDialog(true);
    if (isMobile) {
      setUseCameraScanner(true);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleTitleClick}
            sx={{ mr: 2 }}
          >
            <Home />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AWANA Camp 출석 체크
          </Typography>
          <Chip 
            icon={isMobile ? <PhoneAndroid /> : <Computer />}
            label={isMobile ? "모바일" : "PC"}
            color="secondary"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Toolbar>
      </AppBar>

      {/* Alert */}
      {alertMessage && (
        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      {/* Schedule Grid */}
      <Grid container spacing={3}>
        {Object.entries(scheduleData).map(([day, sessions]) => (
          <Grid item xs={12} md={6} lg={2.4} key={day}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom textAlign="center" color="primary">
                {day}
              </Typography>
              <Stack spacing={1}>
                {sessions.map((session) => (
                  <Button
                    key={session.id}
                    variant="contained"
                    color={getSessionColor(session)}
                    onClick={() => handleSessionClick(session, day)}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      minHeight: 48
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {session.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {session.time}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 출석 체크 다이얼로그 */}
      <Dialog 
        open={attendanceDialog} 
        onClose={handleCloseAttendanceDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday color="primary" />
          {selectedSession && `${selectedSession.day} - ${selectedSession.name} 출석 체크`}
          <IconButton
            onClick={handleCloseAttendanceDialog}
            sx={{ ml: 'auto' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* 바코드 입력 섹션 */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCodeScanner color="primary" />
              바코드 출석 체크
            </Typography>
            
            {/* PC 스캐너 안내 */}
            {!isMobile && (
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
                icon={<Computer />}
              >
                💻 <strong>PC 바코드 스캐너 사용법:</strong>
                <br />
                1. 아래 입력 필드를 클릭하여 포커스를 맞춘 후
                <br />
                2. USB 바코드 스캐너로 QR코드를 스캔하면 자동으로 출석 처리됩니다
                {scanBuffer && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
                    스캔 중... <strong>{scanBuffer}</strong>
                  </Box>
                )}
              </Alert>
            )}
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder={isMobile ? "바코드를 스캔하세요" : "USB 스캐너로 스캔하거나 직접 입력하세요"}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !submitting && handleBarcodeSubmit()}
                autoFocus={!isMobile}
                size="large"
                sx={{ mb: 2 }}
                inputRef={barcodeInputRef}
                variant="outlined"
                helperText={!isMobile ? "💡 입력 필드를 클릭한 후 바코드를 스캔하세요" : ""}
                disabled={submitting}
              />
              
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={handleBarcodeSubmit}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Check />}
                  disabled={!barcodeInput.trim() || submitting}
                  size="large"
                >
                  {submitting ? "처리중..." : "출석 처리"}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={openScannerDialog}
                  startIcon={isMobile ? <CameraAlt /> : <QrCodeScanner />}
                >
                  {isMobile ? "카메라 스캔" : "카메라 스캔 (보조)"}
                </Button>
                
                {!isMobile && (
                  <>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useCameraScanner}
                          onChange={(e) => setUseCameraScanner(e.target.checked)}
                        />
                      }
                      label="카메라 스캐너"
                    />
                    
                    <Button
                      variant="text"
                      onClick={() => {
                        try {
                          barcodeInputRef.current?.focus();
                        } catch (err) {
                          console.warn("Focus error (safely handled):", err);
                        }
                      }}
                      size="small"
                    >
                      🎯 입력 필드 포커스
                    </Button>
                  </>
                )}
                
                <Typography variant="caption" color="text.secondary">
                  {isMobile ? "📱 모바일: 카메라로 QR코드 스캔" : "💻 PC: USB 스캐너 권장 (키보드 입력처럼 작동)"}
                </Typography>
              </Stack>
            </Box>
          </Paper>

          {/* 출석 현황 */}
          <Paper elevation={1}>
            <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person />
                  {showAbsentOnly ? (
                    <>
                      결시자 현황 ({attendanceList.filter(item => !item.attended).length}명)
                      <Chip 
                        label="결시자만 표시" 
                        size="small" 
                        color="warning" 
                        sx={{ ml: 1, backgroundColor: 'rgba(255,193,7,0.8)', color: 'white' }}
                      />
                    </>
                  ) : (
                    <>출석 현황 ({attendanceList.filter(item => item.attended).length}/{attendanceList.length})</>
                  )}
                  {loading && <CircularProgress size={16} color="inherit" />}
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAbsentOnly}
                      onChange={(e) => setShowAbsentOnly(e.target.checked)}
                      sx={{ 
                        '& .MuiSwitch-switchBase': { color: 'white' },
                        '& .MuiSwitch-track': { backgroundColor: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      🔍 결시자만 보기
                    </Typography>
                  }
                />
              </Box>
            </Box>
            
            {/* 로딩 프로그레스 바 */}
            {loading && <LinearProgress />}
            
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>타입</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>이름</TableCell>
                    <TableCell>그룹/역할</TableCell>
                    <TableCell>조/직책</TableCell>
                    <TableCell>출석 시간</TableCell>
                    <TableCell>상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          출석 데이터 로딩 중...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : attendanceList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          대상자가 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (() => {
                      // 필터링 적용
                      const filteredList = showAbsentOnly 
                        ? attendanceList.filter(user => !user.attended)
                        : attendanceList;
                      
                      if (filteredList.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                              <Typography variant="body2" color="text.secondary">
                                {showAbsentOnly ? "🎉 모든 대상자가 출석했습니다!" : "대상자가 없습니다."}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      
                      return filteredList.map((user, index) => (
                    <TableRow key={`${user.user_type}-${user.id}`}>
                      <TableCell>
                        <Chip 
                          label={getKoreanUserType(user.user_type)} 
                          size="small" 
                          color={getUserTypeColor(user.user_type)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{user.user_id}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                          {user.englishName && (
                            <Typography variant="caption" color="text.secondary">
                              {user.englishName}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.studentGroup && (
                          <Chip 
                            label={user.studentGroup} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.team && (
                          <Chip 
                            label={user.user_type === 'student' ? `${user.team}조` : user.team} 
                            size="small" 
                            color="secondary" 
                            variant="outlined" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.attendedAt ? new Date(user.attendedAt).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>
                        {user.attended ? (
                          <Chip label="출석" color="success" size="small" />
                        ) : (
                          <Chip label="미출석" color="default" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                      ));
                    })()
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </DialogContent>
      </Dialog>

      {/* 출석 처리 로딩 백드롭 */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.modal + 1,
          flexDirection: 'column',
          gap: 2
        }}
        open={submitting}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" color="inherit">
          출석 처리 중...
        </Typography>
        <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
          잠시만 기다려주세요
        </Typography>
      </Backdrop>

      {/* 스캐너 다이얼로그 */}
      <Dialog open={scannerDialog} onClose={handleCloseScannerDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile ? <CameraAlt /> : <QrCodeScanner />}
          {isMobile ? "카메라 QR 스캔" : "바코드/QR 스캐너"}
          <IconButton
            onClick={handleCloseScannerDialog}
            sx={{ ml: 'auto' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            {isMobile ? (
              // 모바일: 웹캠 사용
              <Box>
                {useCameraScanner && (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: { ideal: "environment" } // 후면 카메라 우선
                    }}
                    style={{ width: '100%', maxWidth: 400, border: '2px solid #ccc', borderRadius: 8 }}
                  />
                )}
                <Typography variant="body2" sx={{ mt: 2 }}>
                  📱 QR코드나 바코드를 카메라에 비춰주세요
                </Typography>
                {!useCameraScanner && (
                  <Button
                    variant="contained"
                    onClick={() => setUseCameraScanner(true)}
                    startIcon={<CameraAlt />}
                    sx={{ mt: 2 }}
                  >
                    카메라 시작
                  </Button>
                )}
              </Box>
            ) : (
              // PC: USB 스캐너 또는 카메라
              <Box>
                {cameraError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {cameraError}
                  </Alert>
                )}
                
                {useCameraScanner ? (
                  <Box>
                    <video id="video" width="100%" height="300" style={{ border: '2px solid #ccc', borderRadius: 8 }} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      💻 QR코드나 바코드를 카메라에 비춰주세요
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      💻 PC 환경에서는 다음 방법을 사용할 수 있습니다:
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Paper elevation={1} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          🔌 USB 바코드 스캐너 (권장)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          USB 바코드 스캐너를 연결하고 바코드를 스캔하면<br/>
                          자동으로 입력창에 입력됩니다.
                        </Typography>
                      </Paper>
                      
                      <Paper elevation={1} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          📷 웹카메라 스캔
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          카메라를 사용하여 QR코드를 스캔할 수 있습니다.
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => setUseCameraScanner(true)}
                          startIcon={<CameraAlt />}
                        >
                          카메라 스캔 시작
                        </Button>
                      </Paper>
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AttendancePage;
