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
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowBack, Person, Send, Check } from '@mui/icons-material';

const steps = ['개인 정보 입력', '자격 정보 입력', '신청 완료'];

const IndividualTeacherPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [teacherData, setTeacherData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    churchName: '',
    position: '',
    experience: '',
    certification: '',
    motivation: '',
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field) => (event) => {
    setTeacherData({
      ...teacherData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/bt/individual-teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      
      if (response.ok) {
        console.log('개인교사 정보 제출 성공:', teacherData);
        handleNext();
      } else {
        const errorData = await response.json();
        alert(`신청 중 오류가 발생했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="이름"
                value={teacherData.name}
                onChange={handleInputChange('name')}
                variant="outlined"
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="주소"
                value={teacherData.address}
                onChange={handleInputChange('address')}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="소속 교회"
                value={teacherData.churchName}
                onChange={handleInputChange('churchName')}
                variant="outlined"
                helperText="소속 교회가 있다면 입력해주세요"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>교회 내 직책</InputLabel>
                <Select
                  value={teacherData.position}
                  label="교회 내 직책"
                  onChange={handleInputChange('position')}
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
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="보유 자격증"
                value={teacherData.certification}
                onChange={handleInputChange('certification')}
                variant="outlined"
                multiline
                rows={2}
                helperText="교육 관련 자격증이나 수료증이 있다면 입력해주세요"
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
                rows={4}
                helperText="BT 프로그램에 참가하려는 동기나 목표를 작성해주세요"
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box textAlign="center">
            <Check sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              신청이 완료되었습니다!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {teacherData.name}님의 BT 프로그램 신청이 성공적으로 접수되었습니다.
            </Typography>
            <Paper elevation={1} sx={{ p: 3, mt: 3, textAlign: 'left' }}>
              <Typography variant="h6" gutterBottom>신청 정보</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>이름:</strong> {teacherData.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>연락처:</strong> {teacherData.phone}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>이메일:</strong> {teacherData.email}
              </Typography>
              {teacherData.churchName && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>소속 교회:</strong> {teacherData.churchName}
                </Typography>
              )}
              {teacherData.position && (
                <Typography variant="body2">
                  <strong>직책:</strong> {teacherData.position}
                </Typography>
              )}
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              onClick={() => navigate('/select-role')}
              sx={{ color: 'white', minWidth: 'auto' }}
            >
              <ArrowBack />
            </Button>
            <Person sx={{ mr: 1 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              개인교사 신청
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            개인 정보와 자격 정보를 입력해주세요
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Container sx={{ py: 6 }} maxWidth="md">
        <Card sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <CardContent>
            {renderStepContent(activeStep)}
          </CardContent>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              이전
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/select-role')}
                startIcon={<Check />}
              >
                완료
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                onClick={activeStep === steps.length - 2 ? handleSubmit : handleNext}
                startIcon={activeStep === steps.length - 2 ? <Send /> : null}
              >
                {activeStep === steps.length - 2 ? '신청하기' : '다음'}
              </Button>
            )}
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default IndividualTeacherPage;
