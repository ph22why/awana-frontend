import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from '@zxing/library';
import PinAuthDialog from './PinAuthDialog';
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
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import {
  Home,
  QrCodeScanner,
  Close,
  Check,
  Person,
  CameraAlt,
  Inventory,
  CheckCircle,
  List
} from '@mui/icons-material';
import { BACKEND_URL } from "../config";

const ItemDistributionPage = () => {
  const [student, setStudent] = useState(null);
  const [scannerDialog, setScannerDialog] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [distributedItems, setDistributedItems] = useState(new Set());
  const [useCameraScanner, setUseCameraScanner] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [facingMode, setFacingMode] = useState("environment"); // "user" or "environment"
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const webcamRef = useRef(null);
  const codeReader = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isPinVerified, setIsPinVerified] = useState(false);

  useEffect(() => {
    // PIN이 확인되지 않았으면 다른 작업을 하지 않음
    if (!isPinVerified) return;
    
    // 초기화 API 호출
    const initializeSystem = async () => {
      try {
        await axios.post(`${BACKEND_URL}/init-item-distribution`);
        console.log('✅ Item distribution system initialized');
      } catch (error) {
        console.error('Error initializing system:', error);
      }
      fetchProgressData();
    };
    
    initializeSystem();
  }, [isPinVerified]); // Add isPinVerified to dependencies

  useEffect(() => {
    if (useCameraScanner && scannerDialog) {
      startCameraScanner();
    }
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, [useCameraScanner, scannerDialog]);

  // 사용 가능한 카메라 목록 가져오기
  useEffect(() => {
    if (isPinVerified && isMobile) {
      getAvailableCameras();
    }
  }, [isPinVerified, isMobile]);

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      
      if (videoDevices.length > 0 && !selectedCameraId) {
        // 후면 카메라를 기본으로 설정
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        setSelectedCameraId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
      }
    } catch (error) {
      console.warn("카메라 목록을 가져올 수 없습니다:", error);
    }
  };

  const switchCamera = () => {
    if (availableCameras.length > 1) {
      const currentIndex = availableCameras.findIndex(camera => camera.deviceId === selectedCameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      setSelectedCameraId(availableCameras[nextIndex].deviceId);
      
      // facingMode도 업데이트
      const nextCamera = availableCameras[nextIndex];
      if (nextCamera.label.toLowerCase().includes('front') || nextCamera.label.toLowerCase().includes('user')) {
        setFacingMode("user");
      } else {
        setFacingMode("environment");
      }
    } else {
      // 카메라가 2개 미만이면 facingMode만 토글
      setFacingMode(prev => prev === "user" ? "environment" : "user");
    }
  };

  const getCameraDisplayName = (camera) => {
    if (camera.label.toLowerCase().includes('front') || camera.label.toLowerCase().includes('user')) {
      return "전면 카메라";
    } else if (camera.label.toLowerCase().includes('back') || camera.label.toLowerCase().includes('rear') || camera.label.toLowerCase().includes('environment')) {
      return "후면 카메라";
    }
    return camera.label || `카메라 ${camera.deviceId.slice(0, 4)}`;
  };

  const handleWebcamClick = (event) => {
    // 터치/클릭으로 포커스 맞추기 (실험적 기능)
    if (webcamRef.current && isMobile) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      
      console.log(`📱 터치 포커스 시도: (${x.toFixed(1)}%, ${y.toFixed(1)}%)`);
      
      // 시각적 피드백
      showAlert(`📱 포커스 조정 중... (${x.toFixed(0)}%, ${y.toFixed(0)}%)`, "info");
      
      // 웹캠 재시작으로 포커스 갱신 시도
      setTimeout(() => {
        if (useCameraScanner && webcamRef.current) {
          try {
            // 포커스 포인트 힌트로 웹캠 설정 갱신
            webcamRef.current.video?.focus?.();
          } catch (error) {
            console.log("포커스 조정이 지원되지 않는 기기입니다.");
          }
        }
      }, 100);
    }
  };

  const fetchProgressData = async () => {
    try {
      // 전체 학생 수 조회 (출석체크 테이블 기준)
      const studentsResponse = await axios.get(`${BACKEND_URL}/attendance/session1?userTypes=student`);
      const totalStudents = studentsResponse.data.length;
      setTotalStudents(totalStudents);
      
      // 물품 수령 완료 학생 조회
      const completedResponse = await axios.get(`${BACKEND_URL}/item-distribution/completed`);
      const completedStudents = completedResponse.data;
      setCompletedCount(completedStudents.length);
      setDistributedItems(new Set(completedStudents.map(item => item.student_id)));
      
      console.log(`📊 총 학생 수: ${totalStudents}명, 완료: ${completedStudents.length}명`);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      showAlert("데이터를 불러오는데 실패했습니다.", "error");
    }
  };

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(""), 5000);
  };

  const handleBarcodeSubmit = async () => {
    if (!barcodeInput.trim()) {
      showAlert("바코드를 입력해주세요.", "error");
      return;
    }

    try {
      const qrCode = barcodeInput.trim();
      
      // 학생이 아닌 QR 코드 체크
      if (qrCode.includes('ymId=') || qrCode.includes('teacherId=') || qrCode.includes('staffId=')) {
        showAlert("❌ 물품 수령은 학생(STU)만 가능합니다. 학생 QR코드를 스캔해주세요.", "warning");
        setBarcodeInput("");
        return;
      }
      
      // QR 코드에서 학생 ID 추출
      let studentId = qrCode;
      if (studentId.includes('userId=')) {
        studentId = studentId.split('userId=')[1].split('&')[0];
      }

      const response = await axios.get(`${BACKEND_URL}/user/${studentId}`);
      
      if (response.data && response.data.length > 0) {
        const studentData = response.data[0];
        setStudent(studentData);
        setBarcodeInput("");
        setScannerDialog(false);
        showAlert(`${studentData.koreanName} 학생 정보를 불러왔습니다.`, "success");
      } else {
        showAlert("등록된 학생을 찾을 수 없습니다. 학생 QR코드인지 확인해주세요.", "error");
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      showAlert("학생 정보를 불러오는 중 오류가 발생했습니다.", "error");
    }
  };

  const handleItemDistribution = async () => {
    if (!student) return;

    try {
      // DB에 물품 수령 완료 기록
      const response = await axios.post(`${BACKEND_URL}/item-distribution/complete`, {
        studentId: student.id
      });

      if (response.data.success) {
        // 상태 업데이트
        const updatedDistributed = new Set(distributedItems);
        updatedDistributed.add(student.id);
        setDistributedItems(updatedDistributed);
        setCompletedCount(prev => prev + 1);
        
        showAlert(`✅ ${student.koreanName} 물품 전달 완료!`, "success");
        
        // 다음 학생을 위해 초기화
        setTimeout(() => {
          setStudent(null);
          showAlert("다음 학생의 QR코드를 스캔해주세요.", "info");
        }, 2000);
      } else {
        showAlert(response.data.message || "물품 전달 기록 실패", "error");
      }
    } catch (error) {
      console.error("Error recording item distribution:", error);
      
      if (error.response?.status === 400) {
        showAlert("⚠️ 이미 물품을 수령한 학생입니다.", "warning");
      } else {
        showAlert("물품 전달 기록 중 오류가 발생했습니다.", "error");
      }
    }
  };

  const startCameraScanner = async () => {
    try {
      setCameraError("");
      codeReader.current = new BrowserMultiFormatReader();
      
      if (isMobile) {
        startWebcamScanner();
      } else {
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
          setCameraError("카메라가 연결되지 않았습니다.");
        }
      }
    } catch (error) {
      console.error("Scanner error:", error);
      setCameraError("스캐너를 시작할 수 없습니다.");
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

    setTimeout(() => {
      clearInterval(scanInterval);
    }, 30000);
  };

  const openScannerDialog = () => {
    setScannerDialog(true);
    if (isMobile) {
      setUseCameraScanner(true);
    }
  };

  const handleCloseScannerDialog = () => {
    setScannerDialog(false);
    setUseCameraScanner(false);
    setCameraError("");
    if (codeReader.current) {
      codeReader.current.reset();
    }
  };

  const progressPercentage = totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0;

  const handlePinSuccess = () => {
    setIsPinVerified(true);
  };

  // PIN이 확인되지 않았으면 PIN 입력 다이얼로그만 표시
  if (!isPinVerified) {
    return (
      <PinAuthDialog
        open={true}
        onClose={() => navigate('/')}
        onSuccess={handlePinSuccess}
        requiredPin="6790"
        title="물품 수령 관리 인증"
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
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
            <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
            학생(STU) 물품 수령 확인
          </Typography>
          <Button
            color="inherit"
            startIcon={<List />}
            onClick={() => navigate("/item-distribution-list")}
            sx={{ mr: 2 }}
          >
            전체 현황
          </Button>
          <Chip 
            label={`진행률 ${Math.round(progressPercentage)}%`}
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

      {/* Progress Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              학생 물품 전달 진행 상황
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              전체 학생(STU) 대상 물품 수령 현황
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4CAF50'
                }
              }} 
            />
            <Typography variant="body1" sx={{ mt: 1 }}>
              학생 {completedCount} / {totalStudents} 명 완료 ({Math.round(progressPercentage)}%)
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, mb: 1, opacity: 0.9 }} />
            <Typography variant="h6">
              학생 {totalStudents - completedCount} 명 남음
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Student Info Card */}
      {student ? (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={student.image || '/default-avatar.png'}
                sx={{ width: 100, height: 100, border: '3px solid #1976d2' }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom color="primary">
                {student.koreanName} ({student.englishName})
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item>
                  <Chip label={`교회: ${student.churchName}`} color="primary" variant="outlined" />
                </Grid>
                <Grid item>
                  <Chip label={`옷 사이즈: ${student.shirtSize}`} color="secondary" variant="outlined" />
                </Grid>
                <Grid item>
                  <Chip label={`ID: ${student.student_id || student.id}`} color="default" variant="outlined" />
                </Grid>
              </Grid>
              
              {distributedItems.has(student.id) ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  ⚠️ 이미 물품을 수령한 학생입니다.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  ✅ 물품 전달 준비 완료
                </Alert>
              )}
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleItemDistribution}
                  disabled={distributedItems.has(student.id)}
                  startIcon={<Check />}
                  size="large"
                  color="success"
                >
                  {distributedItems.has(student.id) ? "수령 완료됨" : "수령 완료"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setStudent(null)}
                  size="large"
                >
                  다른 학생 선택
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        // Student Selection
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Inventory sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="primary">
            학생 물품 수령 확인
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            학생(STU)의 QR코드를 스캔하여 물품 전달을 확인하세요
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mb: 4, fontWeight: 'bold' }}>
            ⚠️ 학생만 물품 수령 대상입니다 (YM, 교사, 스태프 제외)
          </Typography>
          
          <Stack spacing={3} alignItems="center">
            <TextField
              placeholder="학생(STU) QR코드를 스캔하거나 입력하세요"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
              sx={{ width: 400, maxWidth: '100%' }}
              size="large"
              helperText="💡 학생 QR코드만 스캔 가능합니다"
            />
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleBarcodeSubmit}
                startIcon={<Person />}
                size="large"
              >
                학생 선택
              </Button>
              
              <Button
                variant="outlined"
                onClick={openScannerDialog}
                startIcon={isMobile ? <CameraAlt /> : <QrCodeScanner />}
                size="large"
              >
                {isMobile ? "카메라 스캔" : "QR 스캐너"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Scanner Dialog */}
      <Dialog open={scannerDialog} onClose={handleCloseScannerDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile ? <CameraAlt /> : <QrCodeScanner />}
          QR 코드 스캐너
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
              <Box>
                {useCameraScanner && (
                  <Box sx={{ position: 'relative' }}>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
                        facingMode: !selectedCameraId ? { ideal: facingMode } : undefined,
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                      }}
                      style={{ 
                        width: '100%', 
                        maxWidth: 400, 
                        border: '2px solid #1976d2', 
                        borderRadius: 8,
                        cursor: 'crosshair'
                      }}
                      onClick={handleWebcamClick}
                    />
                    
                    {/* 카메라 전환 버튼 */}
                    {availableCameras.length > 1 && (
                      <IconButton
                        onClick={switchCamera}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                        }}
                        size="small"
                      >
                        🔄
                      </IconButton>
                    )}
                    
                    {/* 카메라 정보 표시 */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {availableCameras.length > 0 ? (
                        getCameraDisplayName(availableCameras.find(c => c.deviceId === selectedCameraId) || availableCameras[0])
                      ) : (
                        facingMode === "user" ? "전면 카메라" : "후면 카메라"
                      )}
                    </Box>
                  </Box>
                )}
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  📱 QR코드를 카메라에 비춰주세요
                  <br />
                  👆 <strong>화면을 터치하여 포커스 조정</strong> • 🔄 버튼으로 카메라 전환
                </Typography>
                
                {!useCameraScanner ? (
                  <Button
                    variant="contained"
                    onClick={() => setUseCameraScanner(true)}
                    startIcon={<CameraAlt />}
                    sx={{ mt: 2 }}
                  >
                    카메라 시작
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={switchCamera}
                      size="small"
                      disabled={availableCameras.length <= 1}
                    >
                      🔄 카메라 전환 ({availableCameras.length})
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => getAvailableCameras()}
                      size="small"
                    >
                      📷 카메라 재검색
                    </Button>
                  </Stack>
                )}
              </Box>
            ) : (
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
                      💻 QR코드를 카메라에 비춰주세요
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setUseCameraScanner(true)}
                    startIcon={<CameraAlt />}
                  >
                    카메라 스캐너 시작
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ItemDistributionPage; 