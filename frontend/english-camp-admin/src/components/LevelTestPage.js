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
  DialogActions,
  IconButton,
  Avatar,
  Chip,
  Rating,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Home,
  QrCodeScanner,
  Close,
  Check,
  Person,
  Quiz,
  CameraAlt,
  Send,
  Star,
  StarBorder,
  NavigateNext,
  NavigateBefore,
  School
} from '@mui/icons-material';
import { BACKEND_URL } from "../config";

const LevelTestPage = () => {
  const [student, setStudent] = useState(null);
  const [scannerDialog, setScannerDialog] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [useCameraScanner, setUseCameraScanner] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // "user" or "environment"
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const webcamRef = useRef(null);
  const codeReader = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 질문 데이터
  const questions = [
    // Easy Questions (0, 1-5 points)
    { id: 1, question: "What is your name?", difficulty: "easy", points: [0, 1, 2, 3, 4, 5] },
    { id: 2, question: "What is your favorite color?", difficulty: "easy", points: [0, 1, 2, 3, 4, 5] },
    { id: 3, question: "What is your favorite animal?", difficulty: "easy", points: [0, 1, 2, 3, 4, 5] },
    { id: 4, question: "What is your favorite food?", difficulty: "easy", points: [0, 1, 2, 3, 4, 5] },
    { id: 5, question: "Do you know Jesus in your heart?", difficulty: "easy", points: [0, 1, 2, 3, 4, 5] },
    
    // Medium Questions (0, 2-6 points)
    { id: 6, question: "Do you have any siblings?", difficulty: "medium", points: [0, 2, 3, 4, 5, 6] },
    { id: 7, question: "What is your favorite subject in school?", difficulty: "medium", points: [0, 2, 3, 4, 5, 6] },
    { id: 8, question: "What is your favorite thing to do?", difficulty: "medium", points: [0, 2, 3, 4, 5, 6] },
    { id: 9, question: "What is your favorite holiday?", difficulty: "medium", points: [0, 2, 3, 4, 5, 6] },
    { id: 10, question: "What is your favorite season?", difficulty: "medium", points: [0, 2, 3, 4, 5, 6] },
    
    // Hard Questions (0, 3-7 points)
    { id: 11, question: "What do you want to be when you grow up?", difficulty: "hard", points: [0, 3, 4, 5, 6, 7] },
    { id: 12, question: "Tell me about your family", difficulty: "hard", points: [0, 3, 4, 5, 6, 7] },
    { id: 13, question: "Tell me about your favorite vacation", difficulty: "hard", points: [0, 3, 4, 5, 6, 7] },
    { id: 14, question: "If you could have any superpower what would it be?", difficulty: "hard", points: [0, 3, 4, 5, 6, 7] },
    { id: 15, question: "What is your favorite part of church?", difficulty: "hard", points: [0, 3, 4, 5, 6, 7] }
  ];

  useEffect(() => {
    // PIN이 확인되지 않았으면 다른 작업을 하지 않음
    if (!isPinVerified) return;
    
    if (useCameraScanner && scannerDialog) {
      startCameraScanner();
    }
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, [useCameraScanner, scannerDialog, isPinVerified]); // Add isPinVerified to dependencies

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

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(""), 5000);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "success";
      case "medium": return "warning";
      case "hard": return "error";
      default: return "default";
    }
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
        setStudent(response.data[0]);
        setBarcodeInput("");
        setScannerDialog(false);
        showAlert(`${response.data[0].koreanName} 학생이 선택되었습니다.`, "success");
      } else {
        showAlert("학생을 찾을 수 없습니다.", "error");
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      showAlert("학생 정보를 불러오는 중 오류가 발생했습니다.", "error");
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

  const handleStartTest = () => {
    setTestStarted(true);
    setCurrentQuestion(0);
    setScores({});
  };

  const handleScoreSelect = (questionId, score) => {
    setScores(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((total, score) => total + score, 0);
  };

  const handleSubmitTest = async () => {
    const totalScore = calculateTotalScore();
    const maxScore = questions.reduce((sum, q) => sum + Math.max(...q.points), 0);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/level-test/submit`, {
        studentId: student.id,
        scores: scores,
        totalScore: totalScore,
        maxScore: maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)
      });

      if (response.data.success) {
        setTestCompleted(true);
        showAlert("레벨테스트가 완료되었습니다!", "success");
      } else {
        showAlert("테스트 제출 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      showAlert("테스트 제출 중 오류가 발생했습니다.", "error");
    }
  };

  const handleNewStudent = () => {
    // 🔄 다음 학생을 위해 초기 상태로 완전 리셋
    setStudent(null);
    setTestStarted(false);
    setTestCompleted(false);
    setCurrentQuestion(0);
    setScores({});
    setBarcodeInput("");
    showAlert("다음 학생의 QR코드를 스캔해주세요.", "info");
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
        requiredPin="0422"
        title="레벨 테스트 인증"
      />
    );
  }

  const progress = testStarted ? ((currentQuestion + 1) / questions.length) * 100 : 0;

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
            <School sx={{ mr: 1, verticalAlign: 'middle' }} />
            English Level Test
          </Typography>
          {student && (
            <Chip 
              label={`${student.koreanName} (${student.englishName})`}
              color="secondary"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Alert */}
      {alertMessage && (
        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      {/* Student Info Card - Always visible when student is selected */}
      {student && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={student.image || '/default-avatar.png'}
                sx={{ width: 80, height: 80, border: '3px solid white' }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {student.koreanName} ({student.englishName})
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Chip label={`Church: ${student.churchName}`} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                </Grid>
                <Grid item>
                  <Chip label={`ID: ${student.student_id || student.id}`} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                </Grid>
                {testStarted && (
                  <Grid item>
                    <Chip 
                      label={`Score: ${calculateTotalScore()}/${questions.reduce((sum, q) => sum + Math.max(...q.points), 0)}`} 
                      color="warning" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Main Content */}
      {!student ? (
        // Student Selection
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Quiz sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="primary">
            English Level Test
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Scan student QR code to start the level test
          </Typography>
          
          <Stack spacing={3} alignItems="center">
            <TextField
              placeholder="Scan or enter student QR code"
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
                startIcon={<Check />}
                size="large"
              >
                Select Student
              </Button>
              
              <Button
                variant="outlined"
                onClick={openScannerDialog}
                startIcon={isMobile ? <CameraAlt /> : <QrCodeScanner />}
                size="large"
              >
                {isMobile ? "Camera Scan" : "QR Scanner"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : testCompleted ? (
        // Test Completed
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Check sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Test Completed!
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Final Score: {calculateTotalScore()}/{questions.reduce((sum, q) => sum + Math.max(...q.points), 0)}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {student.koreanName}'s level test has been submitted successfully.
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleNewStudent}
            startIcon={<Person />}
            size="large"
          >
            Test Another Student
          </Button>
        </Paper>
      ) : !testStarted ? (
        // Test Start
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Ready to start the level test?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            There are 15 questions divided into 3 difficulty levels.
            <br />
            Easy (0, 1-5 points) • Medium (0, 2-6 points) • Hard (0, 3-7 points)
            <br />
            <span style={{ color: '#f57c00', fontWeight: 'bold', fontSize: '14px' }}>
              ⭐ 0 points = No response or completely silent
            </span>
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleStartTest}
            startIcon={<Quiz />}
            size="large"
          >
            Start Level Test
          </Button>
        </Paper>
      ) : (
        // Test Questions
        <Box>
          {/* Progress */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {Math.round(progress)}% Complete
            </Typography>
          </Paper>

          {/* Current Question */}
          <Paper elevation={2} sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Chip 
                label={questions[currentQuestion].difficulty.toUpperCase()}
                color={getDifficultyColor(questions[currentQuestion].difficulty)}
                sx={{ mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {questions[currentQuestion].question}
              </Typography>
            </Box>

            {/* Score Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Rate the student's response:
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {questions[currentQuestion].points.map((point, index) => (
                  <Button
                    key={point}
                    variant={scores[questions[currentQuestion].id] === point ? "contained" : "outlined"}
                    onClick={() => handleScoreSelect(questions[currentQuestion].id, point)}
                    sx={{ minWidth: 60, height: 60 }}
                    color={getDifficultyColor(questions[currentQuestion].difficulty)}
                  >
                    {point}
                  </Button>
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {questions[currentQuestion].difficulty === 'easy' && "0 = No response, 1 = Very poor, 3 = Basic answer, 5 = Clear answer"}
                {questions[currentQuestion].difficulty === 'medium' && "0 = No response, 2 = Poor response, 4 = Good answer, 6 = Excellent answer"}
                {questions[currentQuestion].difficulty === 'hard' && "0 = No response, 3 = Minimal response, 5 = Detailed answer, 7 = Outstanding response"}
              </Typography>
            </Box>

            {/* Navigation */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                startIcon={<NavigateBefore />}
              >
                Previous
              </Button>

              <Typography variant="body2" color="text.secondary">
                Current Score: {calculateTotalScore()} points
              </Typography>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmitTest}
                  disabled={Object.keys(scores).length !== questions.length}
                  startIcon={<Send />}
                  color="success"
                >
                  Submit Test
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNextQuestion}
                  endIcon={<NavigateNext />}
                >
                  Next
                </Button>
              )}
            </Stack>
          </Paper>
        </Box>
      )}

      {/* Scanner Dialog */}
      <Dialog open={scannerDialog} onClose={handleCloseScannerDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile ? <CameraAlt /> : <QrCodeScanner />}
          QR Code Scanner
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
                      💻 Point camera at QR code
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setUseCameraScanner(true)}
                    startIcon={<CameraAlt />}
                  >
                    Start Camera Scanner
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

export default LevelTestPage; 