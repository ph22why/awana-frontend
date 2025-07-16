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
  useTheme
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
  const webcamRef = useRef(null);
  const codeReader = useRef(null);
  const barcodeInputRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 시간표 데이터
  const scheduleData = {
    "첫째날": [
      { id: "day1_interview", name: "인터뷰", time: "오전", type: "special" },
      { id: "day1_dinner", name: "저녁식사", time: "저녁", type: "meal" }
    ],
    "둘째날": [
      { id: "day2_qt", name: "QT", time: "아침", type: "activity" },
      { id: "day2_eng1", name: "영어수업 S1", time: "오전", type: "class" },
      { id: "day2_eng2", name: "영어수업 S2", time: "오전", type: "class" },
      { id: "day2_eng3", name: "영어수업 S3", time: "오전", type: "class" },
      { id: "day2_eng4", name: "영어수업 S4", time: "오후", type: "class" },
      { id: "day2_eng5", name: "영어수업 S5", time: "오후", type: "class" },
      { id: "day2_lunch", name: "점심식사", time: "점심", type: "meal" },
      { id: "day2_dinner", name: "저녁식사", time: "저녁", type: "meal" }
    ],
    "셋째날": [
      { id: "day3_qt", name: "QT", time: "아침", type: "activity" },
      { id: "day3_eng1", name: "영어수업 S1", time: "오전", type: "class" },
      { id: "day3_eng2", name: "영어수업 S2", time: "오전", type: "class" },
      { id: "day3_eng3", name: "영어수업 S3", time: "오전", type: "class" },
      { id: "day3_eng4", name: "영어수업 S4", time: "오후", type: "class" },
      { id: "day3_eng5", name: "영어수업 S5", time: "오후", type: "class" },
      { id: "day3_lunch", name: "점심식사", time: "점심", type: "meal" },
      { id: "day3_waterpark", name: "워터파크", time: "오후", type: "special" },
      { id: "day3_dinner", name: "저녁식사", time: "저녁", type: "meal" }
    ],
    "넷째날": [
      { id: "day4_qt", name: "QT", time: "아침", type: "activity" },
      { id: "day4_eng1", name: "영어수업 S1", time: "오전", type: "class" },
      { id: "day4_eng2", name: "영어수업 S2", time: "오전", type: "class" },
      { id: "day4_eng3", name: "영어수업 S3", time: "오전", type: "class" },
      { id: "day4_eng4", name: "영어수업 S4", time: "오후", type: "class" },
      { id: "day4_eng5", name: "영어수업 S5", time: "오후", type: "class" },
      { id: "day4_lunch", name: "점심식사", time: "점심", type: "meal" },
      { id: "day4_dinner", name: "저녁식사", time: "저녁", type: "meal" }
    ],
    "다섯째날": [
      { id: "day5_qt", name: "QT", time: "아침", type: "activity" },
      { id: "day5_eng1", name: "영어수업 S1", time: "오전", type: "class" },
      { id: "day5_eng2", name: "영어수업 S2", time: "오전", type: "class" },
      { id: "day5_eng3", name: "영어수업 S3", time: "오전", type: "class" },
      { id: "day5_eng4", name: "영어수업 S4", time: "오후", type: "class" },
      { id: "day5_eng5", name: "영어수업 S5", time: "오후", type: "class" },
      { id: "day5_lunch", name: "점심식사", time: "점심", type: "meal" }
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

  // 출석 다이얼로그가 열릴 때 입력 필드에 자동 포커스
  useEffect(() => {
    if (attendanceDialog && barcodeInputRef.current && !isMobile) {
      setTimeout(() => {
        barcodeInputRef.current.focus();
      }, 500);
    }
  }, [attendanceDialog, isMobile]);

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(""), 5000);
  };

  const getSessionColor = (type) => {
    switch (type) {
      case "class": return "primary";
      case "meal": return "warning";
      case "activity": return "success";
      case "special": return "error";
      default: return "default";
    }
  };

  const handleSessionClick = async (session, day) => {
    setSelectedSession({ ...session, day });
    await fetchAttendanceData(session.id);
    setAttendanceDialog(true);
  };

  const fetchAttendanceData = async (sessionId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/attendance/${sessionId}`);
      setAttendanceList(response.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceList([]);
    }
  };

  const handleBarcodeSubmit = async () => {
    if (!barcodeInput.trim()) {
      showAlert("바코드를 입력해주세요.", "error");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/attendance/check`, {
        sessionId: selectedSession.id,
        studentId: barcodeInput.trim()
      });

      if (response.data.success) {
        showAlert(`${response.data.studentName} 출석 처리 완료`, "success");
        setBarcodeInput("");
        setScanBuffer(""); // 스캔 버퍼 초기화
        await fetchAttendanceData(selectedSession.id);
        
        // PC에서는 다시 입력 필드에 포커스
        if (!isMobile && barcodeInputRef.current) {
          setTimeout(() => {
            barcodeInputRef.current.focus();
          }, 500);
        }
      } else {
        showAlert(response.data.message || "출석 처리 실패", "error");
        setBarcodeInput("");
        setScanBuffer(""); // 스캔 버퍼 초기화
        
        // 실패해도 포커스 복원
        if (!isMobile && barcodeInputRef.current) {
          setTimeout(() => {
            barcodeInputRef.current.focus();
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
      showAlert("출석 처리 중 오류가 발생했습니다.", "error");
      setBarcodeInput("");
      setScanBuffer(""); // 스캔 버퍼 초기화
      
      // 오류 시에도 포커스 복원
      if (!isMobile && barcodeInputRef.current) {
        setTimeout(() => {
          barcodeInputRef.current.focus();
        }, 500);
      }
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
                    color={getSessionColor(session.type)}
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
                onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
                autoFocus={!isMobile}
                size="large"
                sx={{ mb: 2 }}
                inputRef={barcodeInputRef}
                variant="outlined"
                helperText={!isMobile ? "💡 입력 필드를 클릭한 후 바코드를 스캔하세요" : ""}
              />
              
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={handleBarcodeSubmit}
                  startIcon={<Check />}
                  disabled={!barcodeInput.trim()}
                >
                  출석 처리
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
                      onClick={() => barcodeInputRef.current?.focus()}
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
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                출석 현황 ({attendanceList.filter(item => item.attended).length}/{attendanceList.length})
              </Typography>
            </Box>
            
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>학생 ID</TableCell>
                    <TableCell>이름</TableCell>
                    <TableCell>그룹</TableCell>
                    <TableCell>조</TableCell>
                    <TableCell>출석 시간</TableCell>
                    <TableCell>상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceList.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.koreanName}</TableCell>
                      <TableCell>
                        <Chip label={student.studentGroup} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={`${student.team}조`} size="small" color="secondary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {student.attendedAt ? new Date(student.attendedAt).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>
                        {student.attended ? (
                          <Chip label="출석" color="success" size="small" />
                        ) : (
                          <Chip label="미출석" color="default" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </DialogContent>
      </Dialog>

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
