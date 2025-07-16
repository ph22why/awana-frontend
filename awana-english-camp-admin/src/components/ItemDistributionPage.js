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
  CheckCircle
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
  const webcamRef = useRef(null);
  const codeReader = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchProgressData();
  }, []);

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

  const fetchProgressData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/students?limit=all`);
      const students = response.data.data || [];
      setTotalStudents(students.length);
      
      // 물품 수령 완료 상태 조회 (임시로 로컬스토리지 사용)
      const completed = JSON.parse(localStorage.getItem('distributedItems') || '[]');
      setCompletedCount(completed.length);
      setDistributedItems(new Set(completed));
    } catch (error) {
      console.error("Error fetching progress data:", error);
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
      // QR 코드에서 학생 ID 추출
      let studentId = barcodeInput.trim();
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
        showAlert("학생을 찾을 수 없습니다.", "error");
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      showAlert("학생 정보를 불러오는 중 오류가 발생했습니다.", "error");
    }
  };

  const handleItemDistribution = () => {
    if (!student) return;

    const updatedDistributed = new Set(distributedItems);
    updatedDistributed.add(student.id);
    setDistributedItems(updatedDistributed);
    
    // 로컬스토리지에 저장
    localStorage.setItem('distributedItems', JSON.stringify([...updatedDistributed]));
    
    setCompletedCount(updatedDistributed.size);
    showAlert(`${student.koreanName} 학생의 물품 전달이 완료되었습니다!`, "success");
    
    // 다음 학생을 위해 초기화
    setTimeout(() => {
      setStudent(null);
      showAlert("다음 학생의 QR코드를 스캔해주세요.", "info");
    }, 2000);
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
            물품 수령 확인
          </Typography>
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
              물품 전달 진행 상황
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
              {completedCount} / {totalStudents} 명 완료 ({Math.round(progressPercentage)}%)
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, mb: 1, opacity: 0.9 }} />
            <Typography variant="h6">
              {totalStudents - completedCount} 명 남음
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
            물품 수령 확인
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            학생의 QR코드를 스캔하여 물품 전달을 확인하세요
          </Typography>
          
          <Stack spacing={3} alignItems="center">
            <TextField
              placeholder="학생 QR코드를 스캔하거나 입력하세요"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
              sx={{ width: 400, maxWidth: '100%' }}
              size="large"
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
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: { ideal: "environment" }
                    }}
                    style={{ width: '100%', maxWidth: 400, border: '2px solid #ccc', borderRadius: 8 }}
                  />
                )}
                <Typography variant="body2" sx={{ mt: 2 }}>
                  📱 QR코드를 카메라에 비춰주세요
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