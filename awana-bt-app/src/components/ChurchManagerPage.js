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
  Autocomplete,
  CircularProgress,
  Stack,
  Chip,
  Alert,
  IconButton,
  Avatar,
} from '@mui/material';
import { 
  ArrowBack, 
  School, 
  Send, 
  Check, 
  Pending,
  ContentCopy,
  Person,
  Key,
  AccountBalance
} from '@mui/icons-material';

const ChurchManagerPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('input'); // 'input', 'pending', 'approved'
  const [churchData, setChurchData] = useState({
    churchName: '',
    churchAddress: '',
    managerPhone: '',
    selectedChurch: null,
  });
  const [churchOptions, setChurchOptions] = useState([]);
  const [churchLoading, setChurchLoading] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  // Mock data for demonstration - keys would come from backend after approval
  const [teacherKeys] = useState([
    { id: 1, key: 'BT2025-CH001-001', name: '', phone: '', assigned: false },
    { id: 2, key: 'BT2025-CH001-002', name: '', phone: '', assigned: false },
    { id: 3, key: 'BT2025-CH001-003', name: '', phone: '', assigned: false },
    { id: 4, key: 'BT2025-CH001-004', name: '', phone: '', assigned: false },
    { id: 5, key: 'BT2025-CH001-005', name: '', phone: '', assigned: false },
  ]);

  const handleSubmit = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3004';
      const submitData = {
        churchName: churchData.churchName,
        churchAddress: churchData.churchAddress,
        managerPhone: churchData.managerPhone,
        churchId: churchData.selectedChurch ? {
          mainId: churchData.selectedChurch.mainId,
          subId: churchData.selectedChurch.subId
        } : null,
      };

      const response = await fetch(`${apiUrl}/api/church-managers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        const result = await response.json();
        setSubmissionData(result);
        // For demo, simulate different states
        setStep('pending'); // Initially pending
        
        // Simulate approval after 3 seconds (in real app, this would be handled by admin)
        setTimeout(() => {
          setStep('approved');
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`신청 중 오류가 발생했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const searchChurches = async (searchQuery) => {
    if (!searchQuery) {
      setChurchOptions([]);
      return;
    }

    // 등록번호 검색의 경우 3자리부터, 교회명 검색의 경우 2자리부터
    const isNumeric = /^\d+$/.test(searchQuery);
    const minLength = isNumeric ? 3 : 2;
    
    if (searchQuery.length < minLength) {
      setChurchOptions([]);
      return;
    }

    setChurchLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3004';
      const response = await fetch(`${apiUrl}/api/bt/churches/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      console.log(`교회 검색 응답 (${isNumeric ? '등록번호' : '교회명'}):`, data);
      
      if (data.success) {
        setChurchOptions(data.data || []);
      } else {
        console.error('교회 검색 실패:', data.message);
        setChurchOptions([]);
      }
    } catch (error) {
      console.error('교회 검색 오류:', error);
      setChurchOptions([]);
    } finally {
      setChurchLoading(false);
    }
  };

  const handleChurchSelect = (church) => {
    setChurchData(prev => ({
      ...prev,
      selectedChurch: church,
      churchName: church.name,
      churchAddress: church.location,
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('복사 완료:', text);
    });
  };

  const renderInputStep = () => (
    <Card 
      sx={{ 
        borderRadius: 4,
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #2C5282 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
        }}
      >
        <School sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          교회 신청
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          교회 정보와 담당자 연락처를 입력해주세요
        </Typography>
      </Box>

      <CardContent sx={{ p: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
              교회 검색
            </Typography>
            <Autocomplete
              options={churchOptions}
              getOptionLabel={(option) => option.name || ''}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {option.name}
                    </Typography>
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
                  label="교회명 또는 등록번호로 검색"
                  placeholder="예: 서울중앙교회 또는 1234"
                  variant="outlined"
                  helperText="교회명 또는 등록번호(3-4자리)를 입력하여 검색하세요"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
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

          {churchData.selectedChurch && (
            <Grid item xs={12}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  선택된 교회 정보
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>교회명:</strong> {churchData.churchName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>주소:</strong> {churchData.churchAddress}
                  </Typography>
                  <Typography variant="body2">
                    <strong>등록번호:</strong> {churchData.selectedChurch.mainId}-{churchData.selectedChurch.subId}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
              담당자 연락처
            </Typography>
            <TextField
              required
              fullWidth
              label="담당자 전화번호"
              value={churchData.managerPhone}
              onChange={(e) => setChurchData(prev => ({ ...prev, managerPhone: e.target.value }))}
              variant="outlined"
              placeholder="010-1234-5678"
              helperText="교회 담당자의 연락처를 입력해주세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!churchData.selectedChurch || !churchData.managerPhone}
            startIcon={<Send />}
            sx={{
              px: 6,
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4A90E2, #2C5282)',
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
            신청하기
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderPendingStep = () => (
    <Card 
      sx={{ 
        borderRadius: 4,
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Pending sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          검토 중
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          본부에서 신청 내용을 검토하고 있습니다
        </Typography>
      </Box>

      <CardContent sx={{ p: 6, textAlign: 'center' }}>
        <Alert 
          severity="info" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          신청이 정상적으로 접수되었습니다. 승인 후 입금 안내가 제공됩니다.
        </Alert>

        <Paper elevation={1} sx={{ p: 4, borderRadius: 3, bgcolor: '#f8fafc' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            신청 정보
          </Typography>
          <Stack spacing={2} sx={{ textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>교회명:</strong> {churchData.churchName}
            </Typography>
            <Typography variant="body2">
              <strong>담당자 연락처:</strong> {churchData.managerPhone}
            </Typography>
            <Typography variant="body2">
              <strong>신청일:</strong> {new Date().toLocaleDateString('ko-KR')}
            </Typography>
          </Stack>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          승인 완료 시 키 관리 화면으로 자동 전환됩니다
        </Typography>
      </CardContent>
    </Card>
  );

  const renderApprovedStep = () => (
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
        <Check sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          승인 완료
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          키가 발급되었습니다. 교사별로 키를 배포해주세요
        </Typography>
      </Box>

      <CardContent sx={{ p: 6 }}>
        <Alert 
          severity="success" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          입금이 확인되었습니다. 교사별 키를 확인하고 배포해주세요.
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance />
            입금 정보
          </Typography>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: '#f0fff4' }}>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>입금 계좌:</strong> 국민은행 123456-78-901234
              </Typography>
              <Typography variant="body2">
                <strong>예금주:</strong> 한국아와나선교회
              </Typography>
              <Typography variant="body2">
                <strong>입금액:</strong> {(teacherKeys.length * 50000).toLocaleString()}원
              </Typography>
              <Typography variant="body2">
                <strong>확인일:</strong> {new Date().toLocaleDateString('ko-KR')}
              </Typography>
            </Stack>
          </Paper>
        </Box>

        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Key />
          교사별 키 관리 ({teacherKeys.length}개)
        </Typography>

        <Grid container spacing={3}>
          {teacherKeys.map((keyData, index) => (
            <Grid item xs={12} key={keyData.id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  border: '2px solid #e2e8f0',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: '#667eea',
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Person />
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Chip 
                        label={`교사 ${index + 1}`}
                        size="small"
                        sx={{ 
                          bgcolor: '#e6fffa', 
                          color: '#319795',
                          fontWeight: 600 
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          bgcolor: '#f7fafc',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: 600,
                          color: '#2d3748'
                        }}
                      >
                        {keyData.key}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(keyData.key)}
                        sx={{ color: '#667eea' }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Stack>
                    
                    <Stack direction="row" spacing={2}>
                      <TextField
                        size="small"
                        placeholder="교사 이름"
                        variant="outlined"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        size="small"
                        placeholder="연락처"
                        variant="outlined"
                        sx={{ flex: 1 }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            mt: 4, 
            borderRadius: 3, 
            bgcolor: '#fff5f5',
            border: '1px solid #feb2b2'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#c53030' }}>
            📋 키 배포 안내
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" color="#742a2a">
              • 각 교사에게 해당하는 키 코드를 전달해주세요
            </Typography>
            <Typography variant="body2" color="#742a2a">
              • 교사는 받은 키로 개인 참가 신청을 진행합니다
            </Typography>
            <Typography variant="body2" color="#742a2a">
              • 키는 한 번만 사용 가능하니 안전하게 보관해주세요
            </Typography>
          </Stack>
        </Paper>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafc' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #2C5282 100%)',
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
              교회담당자 신청
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {step === 'input' && '교회 정보와 담당자 정보를 입력해주세요'}
            {step === 'pending' && '신청 검토가 진행 중입니다'}
            {step === 'approved' && '승인이 완료되었습니다'}
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Container sx={{ py: 6 }} maxWidth="md">
        {step === 'input' && renderInputStep()}
        {step === 'pending' && renderPendingStep()}
        {step === 'approved' && renderApprovedStep()}
      </Container>
    </Box>
  );
};

export default ChurchManagerPage;