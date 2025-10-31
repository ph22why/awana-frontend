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
  AccountBalance,
  Delete,
  PersonAdd,
  Save
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

  const [teacherKeys, setTeacherKeys] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [changeRequests, setChangeRequests] = useState([]);

  // 교회 등록번호로 키 생성 함수
  const generateTeacherKey = (churchId, index) => {
    const mainId = churchId?.mainId || '0000';
    return `BT2025-${mainId.padStart(4, '0')}-${String(index).padStart(3, '0')}`;
  };

  // 교사 정보 업데이트 함수
  const updateTeacherInfo = (index, field, value) => {
    if (field === 'phone') {
      value = formatKoreanPhone(value);
    } else if (field === 'name') {
      // 이름은 한글, 영문만 허용 (숫자, 특수문자, 공백 제거)
      value = value.replace(/[^가-힣a-zA-Z]/g, '');
    }

    setTeacherKeys(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsModified(true);
  };

  // 교사 추가 함수
  const addTeacher = () => {
    const newId = teacherKeys.length + 1;
    const newKey = generateTeacherKey(submissionData?.metadata, newId);
    setTeacherKeys(prev => [
      ...prev,
      { 
        id: newId, 
        key: newKey, 
        name: '', 
        phone: '', 
        assigned: false,
        isNew: true // 새로 추가된 교사 표시
      }
    ]);
    setIsModified(true);
  };

  // 교사 삭제 함수
  const removeTeacher = (index) => {
    setTeacherKeys(prev => {
      const updated = [...prev];
      if (updated[index].isNew) {
        // 새로 추가된 것은 바로 삭제
        updated.splice(index, 1);
      } else {
        // 기존 교사는 삭제 표시만
        updated[index] = { ...updated[index], isDeleted: true };
      }
      return updated;
    });
    setIsModified(true);
  };

  // 교사 정보 저장 함수 (변경 요청으로 처리)
  const saveTeacherInfo = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3004';
      
      // 변경사항 분석
      const originalTeachers = submissionData.teachers || [];
      const changes = [];

      // 새로 추가된 교사들
      teacherKeys.filter(t => t.isNew && !t.isDeleted).forEach(teacher => {
        changes.push({
          type: 'add',
          teacherData: {
            id: teacher.id,
            key: teacher.key,
            name: teacher.name,
            phone: teacher.phone,
          }
        });
      });

      // 삭제 요청된 교사들
      teacherKeys.filter(t => t.isDeleted && !t.isNew).forEach(teacher => {
        changes.push({
          type: 'delete',
          teacherData: {
            id: teacher.id,
            key: teacher.key,
            name: teacher.name,
            phone: teacher.phone,
          }
        });
      });

      if (changes.length === 0) {
        // 일반 저장 (변경사항 없음)
        const response = await fetch(`${apiUrl}/api/bt/church-managers/${submissionData._id}/teachers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ teachers: teacherKeys.filter(t => !t.isDeleted) }),
        });

        if (response.ok) {
          alert('교사 정보가 저장되었습니다.');
          setIsModified(false);
        } else {
          alert('저장 중 오류가 발생했습니다.');
        }
      } else {
        // 변경 요청 제출
        const response = await fetch(`${apiUrl}/api/bt/church-managers/${submissionData._id}/teacher-change-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ changes }),
        });

        if (response.ok) {
          alert('교사 변경 요청이 제출되었습니다. 본부 승인 후 반영됩니다.');
          
          // UI에서 변경 요청 상태 표시
          setTeacherKeys(prev => prev.map(teacher => {
            if (teacher.isNew && !teacher.isDeleted) {
              return { ...teacher, status: 'pending_add', isRequestPending: true };
            } else if (teacher.isDeleted && !teacher.isNew) {
              return { ...teacher, status: 'pending_delete', isRequestPending: true };
            }
            return teacher;
          }));

          setIsModified(false);
        } else {
          alert('변경 요청 제출 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('교사 정보 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 변경 요청 상태 조회 함수
  const loadChangeRequests = async () => {
    if (!submissionData?._id) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3004';
      const response = await fetch(`${apiUrl}/api/bt/teacher-change-requests?churchManagerId=${submissionData._id}`);
      
      if (response.ok) {
        const result = await response.json();
        setChangeRequests(result.data || []);
      }
    } catch (error) {
      console.error('변경 요청 조회 오류:', error);
    }
  };

  // 교사 정보 불러오기 함수
  const loadTeacherInfo = async () => {
    if (!submissionData?._id) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3004';
      const response = await fetch(`${apiUrl}/api/bt/church-managers/${submissionData._id}/teachers`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.data.teachers && result.data.teachers.length > 0) {
          setTeacherKeys(result.data.teachers);
          setIsModified(false);
          
          // 변경 요청 상태도 함께 조회
          loadChangeRequests();
          return;
        }
      }
    } catch (error) {
      console.error('교사 정보 불러오기 오류:', error);
    }

    // 저장된 정보가 없으면 기본 키 생성
    const initialKeys = [];
    const participantCount = submissionData.participants || 5; // 기본 5명
    
    for (let i = 1; i <= participantCount; i++) {
      initialKeys.push({
        id: i,
        key: generateTeacherKey(submissionData.metadata, i),
        name: '',
        phone: '',
        assigned: false,
        status: 'active'
      });
    }
    setTeacherKeys(initialKeys);
    
    // 변경 요청 상태도 조회
    loadChangeRequests();
  };

  // 승인 후 키 생성 시 초기화
  React.useEffect(() => {
    if (submissionData && submissionData.status === 'approved' && teacherKeys.length === 0) {
      loadTeacherInfo();
    }
  }, [submissionData]);

  const checkExistingApplication = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3004';
      const loginData = {
        churchName: churchData.churchName,
        managerPhone: churchData.managerPhone,
      };

      const response = await fetch(`${apiUrl}/api/bt/church-managers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const result = await response.json();
        const existingData = result.data;
        
        // 기존 신청이 있으면 상태에 따라 적절한 화면으로 이동
        setSubmissionData(existingData);
        
        if (existingData.status === 'pending') {
          setStep('pending');
        } else if (existingData.status === 'approved') {
          setStep('approved');
        } else if (existingData.status === 'rejected') {
          alert('이전 신청이 거절되었습니다. 새로운 신청을 진행합니다.');
          return false; // 새 신청 진행
        }
        return true; // 기존 신청 상태 표시
      }
      
      return false; // 기존 신청 없음, 새 신청 진행
    } catch (error) {
      console.error('기존 신청 확인 오류:', error);
      return false; // 오류 시 새 신청 진행
    }
  };

  const handleSubmit = async () => {
    try {
      // 먼저 기존 신청이 있는지 확인
      const hasExisting = await checkExistingApplication();
      if (hasExisting) {
        return; // 기존 신청 상태 화면 표시
      }

      // 새 신청 진행
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

      const response = await fetch(`${apiUrl}/api/bt/church-managers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        const result = await response.json();
        setSubmissionData(result);
        setStep('pending'); // Wait for admin approval
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

    // ReceiptManagePage 방식 적용: 4자리 숫자는 즉시 검색, 3자리는 3자리부터, 교회명은 2자리부터
    const isMainId = /^\d{4}$/.test(searchQuery); // 4자리 등록번호
    const isPartialMainId = /^\d{3}$/.test(searchQuery); // 3자리 등록번호
    const isNumeric = /^\d+$/.test(searchQuery);
    
    let shouldSearch = false;
    if (isMainId) {
      // 4자리 등록번호는 즉시 검색
      shouldSearch = true;
    } else if (isPartialMainId) {
      // 3자리 등록번호는 3자리부터 검색
      shouldSearch = true;
    } else if (!isNumeric && searchQuery.length >= 2) {
      // 교회명은 2자리부터 검색
      shouldSearch = true;
    }
    
    if (!shouldSearch) {
      setChurchOptions([]);
      return;
    }

    setChurchLoading(true);
    try {
      // ReceiptPage 방식 완전 복사: church-service에 직접 요청
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3004';
      const requestUrl = `${apiUrl}/api/churches`;
      
      let params;
      
      if (isMainId || isPartialMainId) {
        // 등록번호 검색: ReceiptPage와 동일하게 전체 데이터를 가져와서 클라이언트에서 필터링
        params = new URLSearchParams({
          limit: '10000' // ReceiptPage와 동일한 큰 값 사용
        });
      } else {
        // 교회명으로 검색
        params = new URLSearchParams({
          search: searchQuery,
          limit: '10000' // ReceiptPage와 동일한 큰 값 사용
        });
      }
      
      const response = await fetch(`${requestUrl}?${params}`);
      const data = await response.json();
      
      console.log(`교회 검색 응답 (${isMainId ? '4자리 등록번호' : isPartialMainId ? '3자리 등록번호' : '교회명'}):`, data);
      console.log('전체 데이터 개수:', data.count, '받은 데이터 개수:', data.data?.length);
      
      if (data.success || data.data) {
        let churches = data.data || [];
        
        // 등록번호 검색의 경우 클라이언트에서 필터링 (ReceiptPage 방식)
        if (isMainId || isPartialMainId) {
          churches = churches.filter(church => 
            church.mainId && church.mainId.includes(searchQuery)
          );
          console.log('등록번호 필터링 후:', churches.length, '개 교회');
        }
        
        setChurchOptions(churches);
        
        // ReceiptPage 방식: 4자리 등록번호로 정확히 1개 교회가 검색되면 자동 선택
        if (isMainId && churches.length === 1) {
          const church = churches[0];
          console.log('4자리 등록번호로 정확히 1개 교회 발견, 자동 선택:', church);
          handleChurchSelect(church);
        }
      } else {
        console.error('교회 검색 실패:', data.message || data.error);
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

  // 한국 휴대폰 번호 입력 하이픈 자동 포맷터 (숫자만 허용, 최대 11자리)
  const formatKoreanPhone = (raw) => {
    const digits = (raw || '').replace(/\D/g, '').slice(0, 11);

    // 010, 011, 016, 017, 018, 019 등 3자리 식별자 기준 포맷팅
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
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
                  label="교회명으로 검색"
                  placeholder="예: 서울중앙교회 또는 1234"
                  variant="outlined"
                  helperText="교회명을 입력하여 검색하세요"
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
              onChange={(e) => setChurchData(prev => ({ ...prev, managerPhone: formatKoreanPhone(e.target.value) }))}
              variant="outlined"
              placeholder="010-1234-5678"
              helperText="교회 담당자의 연락처를 입력해주세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
          {teacherKeys.filter(key => !key.isDeleted).map((keyData, index) => (
            <Grid item xs={12} key={keyData.id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  border: keyData.isRequestPending ? '2px solid #ff9500' : 
                          keyData.isNew ? '2px solid #ffd700' : 
                          keyData.isDeleted ? '2px solid #ff6b6b' : 
                          '2px solid #e2e8f0',
                  opacity: keyData.isDeleted || keyData.isRequestPending ? 0.7 : 1,
                  bgcolor: keyData.isRequestPending ? '#fff8f0' :
                           keyData.isNew ? '#fffbf0' : 
                           keyData.isDeleted ? '#fff5f5' : 
                           'white',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: keyData.isNew ? '#ffd700' : keyData.isDeleted ? '#ff6b6b' : '#667eea',
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Person />
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Chip 
                        label={keyData.isRequestPending ? `승인 대기 ${index + 1}` :
                               keyData.isNew ? `신규 교사 ${index + 1}` : 
                               keyData.isDeleted ? `삭제 예정 ${index + 1}` : 
                               `교사 ${index + 1}`}
                        size="small"
                        sx={{ 
                          bgcolor: keyData.isRequestPending ? '#ffe4b5' :
                                   keyData.isNew ? '#fff3cd' : 
                                   keyData.isDeleted ? '#f8d7da' : 
                                   '#e6fffa', 
                          color: keyData.isRequestPending ? '#cc7a00' :
                                 keyData.isNew ? '#856404' : 
                                 keyData.isDeleted ? '#721c24' : 
                                 '#319795',
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
                      <IconButton 
                        size="small" 
                        onClick={() => removeTeacher(index)}
                        sx={{ color: '#ff6b6b' }}
                        disabled={keyData.isDeleted}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                    
                    <Stack direction="row" spacing={2}>
                      <TextField
                        size="small"
                        placeholder="교사 이름"
                        variant="outlined"
                        value={keyData.name || ''}
                        onChange={(e) => updateTeacherInfo(index, 'name', e.target.value)}
                        disabled={keyData.isDeleted}
                        sx={{ flex: 1 }}
                        helperText="한글, 영문만 입력 가능"
                      />
                      <TextField
                        size="small"
                        placeholder="010-1234-5678"
                        variant="outlined"
                        value={keyData.phone || ''}
                        onChange={(e) => updateTeacherInfo(index, 'phone', e.target.value)}
                        disabled={keyData.isDeleted}
                        sx={{ flex: 1 }}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        helperText="연락처 자동 포맷팅"
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 교사 추가/저장 버튼 */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={addTeacher}
            startIcon={<PersonAdd />}
            sx={{
              borderColor: '#4A90E2',
              color: '#4A90E2',
              '&:hover': {
                borderColor: '#2C5282',
                color: '#2C5282',
              }
            }}
          >
            교사 추가
          </Button>
          <Button
            variant="contained"
            onClick={saveTeacherInfo}
            disabled={!isModified}
            startIcon={<Save />}
            sx={{
              background: isModified ? 'linear-gradient(135deg, #4A90E2, #2C5282)' : '#e2e8f0',
              color: isModified ? 'white' : '#a0aec0',
              '&:hover': {
                background: isModified ? 'linear-gradient(135deg, #2C5282, #1A365D)' : '#e2e8f0',
              }
            }}
          >
            저장하기
          </Button>
        </Box>

        {/* 거절된 변경 요청 알림 */}
        {changeRequests.filter(req => req.status === 'rejected').length > 0 && (
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
              ❌ 거절된 변경 요청
            </Typography>
            {changeRequests.filter(req => req.status === 'rejected').map((request, index) => (
              <Alert 
                key={index}
                severity="error" 
                sx={{ mb: 2 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {request.requestType === 'add' ? '교사 추가' : '교사 삭제'} 요청이 거절되었습니다.
                </Typography>
                <Typography variant="body2">
                  교사: {request.teacherData.name} ({request.teacherData.phone})
                </Typography>
                {request.rejectionReason && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    거절 사유: {request.rejectionReason}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  처리일: {new Date(request.processedDate).toLocaleDateString('ko-KR')}
                </Typography>
              </Alert>
            ))}
          </Paper>
        )}

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