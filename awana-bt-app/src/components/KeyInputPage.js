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
  Paper,
  Stack,
  Alert,
  IconButton,
} from '@mui/material';
import { 
  ArrowBack, 
  Key, 
  Send,
  HelpOutline,
  School,
  ContactPhone
} from '@mui/icons-material';

const KeyInputPage = () => {
  const navigate = useNavigate();
  const [keyCode, setKeyCode] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleKeySubmit = async () => {
    if (!keyCode.trim()) {
      alert('키 코드를 입력해주세요.');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3004';
      
      // Validate key code format (basic validation)
      const keyPattern = /^BT2025-CH\d{3}-\d{3}$/i;
      if (!keyPattern.test(keyCode.trim())) {
        alert('올바른 키 코드 형식이 아닙니다. (예: BT2025-CH001-001)');
        return;
      }

      // Here you would normally validate the key with the backend
      // For now, we'll just proceed to the individual teacher page
      navigate('/individual-teacher', { 
        state: { 
          validatedKey: keyCode.trim().toUpperCase(),
          skipKeyInput: true 
        } 
      });
      
    } catch (error) {
      console.error('키 검증 오류:', error);
      alert('키 검증 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)' }}>
      {/* Header */}
      <Box
        sx={{
          color: 'white',
          py: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'translate(50%, -50%)',
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              키 코드 입력
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
            교회담당자로부터 받은 키 코드를 입력해주세요
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Box sx={{ bgcolor: 'white', py: 8, borderRadius: { xs: 0, md: '32px 32px 0 0' }, mt: -4, position: 'relative', zIndex: 2 }}>
        <Container maxWidth="md">
          <Card 
            sx={{ 
              borderRadius: 4,
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #48BB78, #38A169)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
                  }}
                >
                  <Key sx={{ fontSize: 60, color: 'white' }} />
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                  키 코드를 입력하세요
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                  교회담당자가 본부 승인 후 발급받은 키 코드를 정확히 입력해주세요.
                  키 코드는 대소문자를 구분하지 않습니다.
                </Typography>
              </Box>

              <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
                <TextField
                  fullWidth
                  label="키 코드"
                  value={keyCode}
                  onChange={(e) => setKeyCode(e.target.value.toUpperCase())}
                  variant="outlined"
                  placeholder="BT2025-CH001-001"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.3rem',
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
                      py: 2.5,
                      fontWeight: 600,
                      letterSpacing: 2,
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    키 형식: BT2025-CH###-###
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowHelp(!showHelp)}
                    sx={{ color: '#667eea' }}
                  >
                    <HelpOutline fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {showHelp && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">
                    키 코드는 교회담당자가 본부에서 승인받은 후 발급받는 코드입니다. 
                    교회담당자에게 문의하여 개인 키를 받아주세요.
                  </Typography>
                </Alert>
              )}

              <Paper 
                elevation={1} 
                sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  bgcolor: '#fef5e7',
                  border: '1px solid #f6ad55',
                  mb: 4
                }}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#c05621' }}>
                  📌 키 발급 프로세스
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: '#667eea', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      flexShrink: 0,
                      mt: 0.5
                    }}>
                      1
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        교회담당자가 신청
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        교회담당자가 교회 정보로 BT 프로그램 신청
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: '#f6ad55', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      flexShrink: 0,
                      mt: 0.5
                    }}>
                      2
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        본부 승인 및 입금 확인
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        아와나 본부에서 신청 승인 후 입금 확인
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: '#48bb78', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      flexShrink: 0,
                      mt: 0.5
                    }}>
                      3
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        키 발급 및 배포
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        교회담당자가 개별 교사에게 키 코드 배포
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              <Paper 
                elevation={1} 
                sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  bgcolor: '#e6fffa',
                  border: '1px solid #4fd1c7',
                  mb: 6
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c7a7b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ContactPhone />
                  키가 없으신가요?
                </Typography>
                <Typography variant="body2" color="#2c7a7b" sx={{ mb: 2 }}>
                  교회담당자에게 문의하여 개인 키를 받아주세요.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<School />}
                    sx={{
                      borderColor: '#4fd1c7',
                      color: '#2c7a7b',
                      '&:hover': {
                        borderColor: '#38b2ac',
                        bgcolor: 'rgba(79, 209, 199, 0.04)',
                      }
                    }}
                  >
                    교회담당자 연락
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#4fd1c7',
                      color: '#2c7a7b',
                      '&:hover': {
                        borderColor: '#38b2ac',
                        bgcolor: 'rgba(79, 209, 199, 0.04)',
                      }
                    }}
                  >
                    아와나 본부 문의
                  </Button>
                </Stack>
              </Paper>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleKeySubmit}
                  disabled={!keyCode.trim()}
                  startIcon={<Send />}
                  sx={{
                    px: 8,
                    py: 2.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #48BB78, #38A169)',
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(240, 147, 251, 0.4)',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(240, 147, 251, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: '#e2e8f0',
                      color: '#a0aec0',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  키 확인하고 시작하기
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default KeyInputPage;
