import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Paper,
  Divider,
  Stack,
  Chip,
  Alert,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { 
  ArrowBack, 
  Key, 
  Send, 
  QrCode,
  Person,
  CheckCircle,
  School,
  Phone,
  Email,
  LocationOn
} from '@mui/icons-material';

const IndividualTeacherPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('key-input'); // 'key-input', 'info-input', 'qr-generated'
  const [keyCode, setKeyCode] = useState('');
  const [keyValid, setKeyValid] = useState(false);
  const [teacherData, setTeacherData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    churchName: '',
    position: '',
    experience: '',
    motivation: '',
  });

  const handleKeySubmit = async () => {
    try {
      // Simulate key validation
      if (keyCode.length >= 10) {
        setKeyValid(true);
        setStep('info-input');
      } else {
        alert('올바른 키 코드를 입력해주세요.');
      }
    } catch (error) {
      console.error('키 검증 오류:', error);
      alert('키 검증 중 오류가 발생했습니다.');
    }
  };

  const handleTeacherSubmit = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3004';
      const submitData = {
        ...teacherData,
        keyCode: keyCode,
      };

      const response = await fetch(`${apiUrl}/api/individual-teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        setStep('qr-generated');
      } else {
        const errorData = await response.json();
        alert(`신청 중 오류가 발생했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleInputChange = (field) => (event) => {
    setTeacherData({
      ...teacherData,
      [field]: event.target.value,
    });
  };

  const renderKeyInputStep = () => (
    <Card 
      sx={{ 
        borderRadius: 4,
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Key sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          키 코드 입력
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          교회담당자로부터 받은 키 코드를 입력해주세요
        </Typography>
      </Box>

      <CardContent sx={{ p: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <TextField
            fullWidth
            label="키 코드"
            value={keyCode}
            onChange={(e) => setKeyCode(e.target.value.toUpperCase())}
            variant="outlined"
            placeholder="BT2025-CH001-001"
            helperText="키 코드는 대소문자를 구분하지 않습니다"
            sx={{
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                textAlign: 'center',
              },
              '& .MuiInputLabel-root': {
                fontSize: '1.1rem',
                fontWeight: 600,
              }
            }}
            InputProps={{
              sx: {
                py: 2,
                fontWeight: 600,
                letterSpacing: 1,
              }
            }}
          />
        </Box>

        <Alert 
          severity="info" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
          }}
        >
          키 코드는 교회담당자가 본부 승인 후 발급받은 코드입니다. 
          교회담당자에게 문의하여 키를 받아주세요.
        </Alert>

        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            bgcolor: '#fef5e7',
            border: '1px solid #f6ad55'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#c05621' }}>
            📌 키 코드 형식 안내
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" color="#9c4221">
              • 형식: BT2025-CH###-### (예: BT2025-CH001-001)
            </Typography>
            <Typography variant="body2" color="#9c4221">
              • 각 키는 한 명의 교사에게만 할당됩니다
            </Typography>
            <Typography variant="body2" color="#9c4221">
              • 키는 일회용이므로 정확히 입력해주세요
            </Typography>
          </Stack>
        </Paper>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleKeySubmit}
            disabled={!keyCode.trim()}
            startIcon={<Send />}
            sx={{
              px: 6,
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #48BB78, #38A169)',
              fontWeight: 600,
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(240, 147, 251, 0.4)',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(240, 147, 251, 0.6)',
              },
              '&:disabled': {
                background: '#e2e8f0',
                color: '#a0aec0',
              }
            }}
          >
            키 확인하기
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderInfoInputStep = () => (
    <Card 
      sx={{ 
        borderRadius: 4,
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Person sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          개인 정보 입력
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          키가 확인되었습니다. 개인 정보를 입력해주세요
        </Typography>
      </Box>

      <CardContent sx={{ p: 6 }}>
        <Alert 
          severity="success" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
          }}
        >
          키 코드 {keyCode}가 정상적으로 확인되었습니다.
        </Alert>

        <Grid container spacing={4}>
          {/* 기본 정보 */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person />
              기본 정보
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="이름"
              value={teacherData.name}
              onChange={handleInputChange('name')}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="전화번호"
              value={teacherData.phone}
              onChange={handleInputChange('phone')}
              variant="outlined"
              placeholder="010-1234-5678"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="이메일"
              type="email"
              value={teacherData.email}
              onChange={handleInputChange('email')}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="주소"
              value={teacherData.address}
              onChange={handleInputChange('address')}
              variant="outlined"
              multiline
              rows={2}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          {/* 소속 정보 */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <School />
              소속 정보
            </Typography>
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="소속 교회"
              value={teacherData.churchName}
              onChange={handleInputChange('churchName')}
              variant="outlined"
              helperText="소속 교회가 있다면 입력해주세요"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>교회 내 직책</InputLabel>
              <Select
                value={teacherData.position}
                label="교회 내 직책"
                onChange={handleInputChange('position')}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="교사">교사</MenuItem>
                <MenuItem value="전도사">전도사</MenuItem>
                <MenuItem value="목사">목사</MenuItem>
                <MenuItem value="장로">장로</MenuItem>
                <MenuItem value="권사">권사</MenuItem>
                <MenuItem value="집사">집사</MenuItem>
                <MenuItem value="기타">기타</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 추가 정보 */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              추가 정보
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="교육 경력"
              value={teacherData.experience}
              onChange={handleInputChange('experience')}
              variant="outlined"
              multiline
              rows={3}
              helperText="교육 관련 경력이나 경험을 자유롭게 작성해주세요"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="참가 동기"
              value={teacherData.motivation}
              onChange={handleInputChange('motivation')}
              variant="outlined"
              multiline
              rows={3}
              helperText="BT 프로그램에 참가하려는 동기나 목표를 작성해주세요"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleTeacherSubmit}
            disabled={!teacherData.name || !teacherData.phone || !teacherData.email || !teacherData.motivation}
            startIcon={<Send />}
            sx={{
              px: 6,
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              fontWeight: 600,
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.6)',
              },
              '&:disabled': {
                background: '#e2e8f0',
                color: '#a0aec0',
              }
            }}
          >
            정보 제출하기
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderQRGeneratedStep = () => (
    <Card 
      sx={{ 
        borderRadius: 4,
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
        }}
      >
        <QrCode sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          등록 완료
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          QR 코드가 생성되었습니다
        </Typography>
      </Box>

      <CardContent sx={{ p: 6, textAlign: 'center' }}>
        <Alert 
          severity="success" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
          }}
        >
          {teacherData.name}님의 BT 프로그램 등록이 완료되었습니다!
        </Alert>

        {/* QR Code Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            bgcolor: 'white',
            border: '3px solid #e6fffa',
            mb: 4,
            maxWidth: 300,
            mx: 'auto'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d3748' }}>
            참가 QR 코드
          </Typography>
          
          {/* Placeholder QR Code - in real app, this would be generated QR */}
          <Box
            sx={{
              width: 200,
              height: 200,
              mx: 'auto',
              mb: 3,
              bgcolor: '#f7fafc',
              border: '2px dashed #cbd5e0',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <QrCode sx={{ fontSize: 80, color: '#a0aec0', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              QR 코드 영역
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace',
              bgcolor: '#f7fafc',
              px: 2,
              py: 1,
              borderRadius: 1,
              fontWeight: 600,
              color: '#2d3748'
            }}
          >
            ID: {keyCode}-{teacherData.name?.slice(0, 2)}
          </Typography>
        </Paper>

        {/* 등록 정보 */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            bgcolor: '#f8fafc',
            textAlign: 'left',
            mb: 4
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            등록 정보
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 20, color: '#667eea' }} />
                  <Typography variant="body2">
                    <strong>이름:</strong> {teacherData.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 20, color: '#667eea' }} />
                  <Typography variant="body2">
                    <strong>연락처:</strong> {teacherData.phone}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 20, color: '#667eea' }} />
                  <Typography variant="body2">
                    <strong>이메일:</strong> {teacherData.email}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={2}>
                {teacherData.churchName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School sx={{ fontSize: 20, color: '#667eea' }} />
                    <Typography variant="body2">
                      <strong>소속 교회:</strong> {teacherData.churchName}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Key sx={{ fontSize: 20, color: '#667eea' }} />
                  <Typography variant="body2">
                    <strong>키 코드:</strong> {keyCode}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 20, color: '#667eea' }} />
                  <Typography variant="body2">
                    <strong>등록일:</strong> {new Date().toLocaleDateString('ko-KR')}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* 안내사항 */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            bgcolor: '#fff5f5',
            border: '1px solid #feb2b2'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#c53030' }}>
            📱 QR 코드 사용 안내
          </Typography>
          <Stack spacing={1} sx={{ textAlign: 'left' }}>
            <Typography variant="body2" color="#742a2a">
              • 교육 현장에서 QR 코드를 통해 출석체크가 진행됩니다
            </Typography>
            <Typography variant="body2" color="#742a2a">
              • QR 코드를 스크린샷으로 저장하거나 인쇄하여 준비해주세요
            </Typography>
            <Typography variant="body2" color="#742a2a">
              • QR 코드 분실 시 등록된 연락처로 문의해주세요
            </Typography>
          </Stack>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/select-role')}
            sx={{
              mr: 2,
              borderRadius: 2,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a67d8',
                bgcolor: 'rgba(102, 126, 234, 0.04)',
              }
            }}
          >
            처음으로
          </Button>
          <Button
            variant="contained"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #48bb78, #38a169)',
              '&:hover': {
                background: 'linear-gradient(135deg, #38a169, #2f855a)',
              }
            }}
          >
            QR 저장
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafc' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
          color: 'white',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              onClick={() => navigate('/select-role')}
              sx={{ 
                color: 'white', 
                minWidth: 'auto',
                p: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ArrowBack />
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              개인교사 신청
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {step === 'key-input' && '키 코드를 입력하여 참가 신청을 시작하세요'}
            {step === 'info-input' && '개인 정보를 입력해주세요'}
            {step === 'qr-generated' && 'QR 코드가 생성되었습니다'}
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Container sx={{ py: 6 }} maxWidth="md">
        {step === 'key-input' && renderKeyInputStep()}
        {step === 'info-input' && renderInfoInputStep()}
        {step === 'qr-generated' && renderQRGeneratedStep()}
      </Container>
    </Box>
  );
};

export default IndividualTeacherPage;