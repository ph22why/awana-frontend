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
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, School, Send, Check } from '@mui/icons-material';

const steps = ['교회 정보 입력', '담당자 정보 입력', '신청 완료'];

const ChurchManagerPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [churchData, setChurchData] = useState({
    churchName: '',
    churchAddress: '',
    churchPhone: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    participants: '',
  });
  const [churchOptions, setChurchOptions] = useState([]);
  const [churchLoading, setChurchLoading] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field) => (event) => {
    setChurchData({
      ...churchData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/bt/church-managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(churchData),
      });
      
      if (response.ok) {
        console.log('교회 정보 제출 성공:', churchData);
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

  // 교회 검색 함수
  const searchChurches = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setChurchOptions([]);
      return;
    }

    setChurchLoading(true);
    try {
      const response = await fetch(`/api/bt/churches/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setChurchOptions(data.data || []);
      } else {
        setChurchOptions([]);
      }
    } catch (error) {
      console.error('교회 검색 오류:', error);
      setChurchOptions([]);
    } finally {
      setChurchLoading(false);
    }
  };

  // 교회 선택 시 정보 자동 입력
  const handleChurchSelect = (church) => {
    setSelectedChurch(church);
    setChurchData(prev => ({
      ...prev,
      churchName: church.name,
      churchAddress: church.location,
      churchPhone: '', // 교회 전화번호는 별도 입력
    }));
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                options={churchOptions}
                getOptionLabel={(option) => option.name || ''}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.location} ({option.mainId}-{option.subId})
                      </Typography>
                    </Box>
                  </Box>
                )}
                onInputChange={(event, newInputValue) => {
                  searchChurches(newInputValue);
                }}
                onChange={(event, newValue) => {
                  if (newValue) {
                    handleChurchSelect(newValue);
                  }
                }}
                loading={churchLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="교회명 검색"
                    variant="outlined"
                    helperText="교회명을 입력하여 검색하세요"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {churchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="교회 주소"
                value={churchData.churchAddress}
                onChange={handleInputChange('churchAddress')}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="교회 전화번호"
                value={churchData.churchPhone}
                onChange={handleInputChange('churchPhone')}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="담당자 이름"
                value={churchData.managerName}
                onChange={handleInputChange('managerName')}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="담당자 전화번호"
                value={churchData.managerPhone}
                onChange={handleInputChange('managerPhone')}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="담당자 이메일"
                type="email"
                value={churchData.managerEmail}
                onChange={handleInputChange('managerEmail')}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="예상 참가자 수"
                type="number"
                value={churchData.participants}
                onChange={handleInputChange('participants')}
                variant="outlined"
                helperText="대략적인 참가자 수를 입력해주세요"
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
              {churchData.churchName}의 BT 프로그램 신청이 성공적으로 접수되었습니다.
            </Typography>

            {/* 신청 정보 */}
            <Paper elevation={1} sx={{ p: 3, mt: 3, textAlign: 'left' }}>
              <Typography variant="h6" gutterBottom>신청 정보</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>교회명:</strong> {churchData.churchName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>담당자:</strong> {churchData.managerName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>연락처:</strong> {churchData.managerPhone}
              </Typography>
              <Typography variant="body2">
                <strong>이메일:</strong> {churchData.managerEmail}
              </Typography>
            </Paper>

            {/* 다음 단계 안내 */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                mt: 3, 
                bgcolor: '#fff3e0', 
                border: '1px solid #ffb74d',
                textAlign: 'left' 
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: '#f57c00', fontWeight: 600 }}>
                📋 다음 단계 안내
              </Typography>
              <Divider sx={{ mb: 2, bgcolor: '#ffb74d' }} />
              
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                🔍 <strong>본부에서 확인 중입니다</strong>
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                신청서 검토 후 승인되면 아래 계좌로 참가비를 입금해주세요.
              </Typography>

              <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  💳 입금 계좌 정보
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>은행:</strong> 국민은행
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>계좌번호:</strong> 123456-78-901234
                </Typography>
                <Typography variant="body2">
                  <strong>예금주:</strong> 한국아와나선교회
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#d84315', fontWeight: 500 }}>
                ⚠️ 입금 확인 후 본부에서 최종 승인 처리됩니다.
              </Typography>
            </Paper>

            {/* 문의 안내 */}
            <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" color="text.secondary">
                📞 문의사항이 있으시면 아와나 본부로 연락 주세요.
              </Typography>
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
          bgcolor: 'primary.main',
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
            <School sx={{ mr: 1 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              교회담당자 신청
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            교회 정보와 담당자 정보를 입력해주세요
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
                onClick={() => navigate('/select-role')}
                startIcon={<Check />}
              >
                완료
              </Button>
            ) : (
              <Button
                variant="contained"
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

export default ChurchManagerPage;
