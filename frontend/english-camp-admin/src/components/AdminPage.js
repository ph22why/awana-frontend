import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
  Toolbar,
  AppBar,
  Pagination,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Download,
  Group,
  EmojiEvents,
  Home,
  Refresh
} from '@mui/icons-material';
import { BACKEND_URL } from "../config";

const AdminPage = () => {
  const [data, setData] = useState([]);
  const [type, setType] = useState("students");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(30);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const navigate = useNavigate();

  // 현재 페이지 데이터만 받아오기
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/${type}`, {
        params: { search, limit, page }
      });
      let fetchedData = [];
      let total = 0;
      if (Array.isArray(response.data)) {
        fetchedData = response.data;
        total = response.data.length;
      } else if (Array.isArray(response.data?.data)) {
        fetchedData = response.data.data;
        total = response.data.totalCount || response.data.total || fetchedData.length;
      } else {
        fetchedData = [];
        total = 0;
      }
      // 대용량 필드 제거
      const filteredData = fetchedData.map(row => {
        const { image, qrCode, ...rest } = row;
        return rest;
      });
      setData(filteredData);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / (limit === 'all' ? total : limit)));
    } catch (error) {
      setData([]);
      setTotalCount(0);
      setTotalPages(1);
      showAlert("데이터를 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [type, search, limit, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(""), 5000);
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleDelete = (id) => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      axios
        .delete(`${BACKEND_URL}/admin/${type}/${id}`)
        .then(() => {
          fetchData();
          showAlert("삭제가 완료되었습니다.");
        })
        .catch((error) => {
          showAlert("삭제 중 오류가 발생했습니다.", "error");
        });
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    const editDataFormatted = { ...item };
    if (editDataFormatted.gender === 'male') {
      editDataFormatted.gender = '남자';
    } else if (editDataFormatted.gender === 'female') {
      editDataFormatted.gender = '여자';
    }
    setEditData(editDataFormatted);
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = () => {
    const dataToSend = { ...editData };
    if (dataToSend.gender === '남자') {
      dataToSend.gender = 'male';
    } else if (dataToSend.gender === '여자') {
      dataToSend.gender = 'female';
    }
    axios
      .put(`${BACKEND_URL}/admin/${type}/${editItem.id}`, dataToSend)
      .then((response) => {
        setEditItem(null);
        fetchData();
        showAlert('수정이 완료되었습니다.');
      })
      .catch((error) => {
        showAlert(`수정 중 오류가 발생했습니다: ${error.response?.data?.error || error.message}`, "error");
      });
  };

  const handleTitleClick = () => {
    navigate("/");
  };

  const handleLimitChange = (e) => {
    const newLimit = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setPage(1);
  };

  // const handleAssignGroups = async () => {
  //   try {
  //     const response = await axios.post(`${BACKEND_URL}/admin/assign-groups`);
  //     showAlert(response.data.message);
  //     fetchData();
  //   } catch (error) {
  //     showAlert("그룹 배정 중 오류가 발생했습니다.", "error");
  //   }
  // };

  // const handleRankAssignment = async () => {
  //   try {
  //     const response = await axios.put(`${BACKEND_URL}/score/all-rank`);
  //     showAlert(response.data.message);
  //     fetchData();
  //   } catch (error) {
  //     showAlert("등급 부여 중 오류가 발생했습니다.", "error");
  //   }
  // };

  // 엑셀 다운로드는 export API만 시도, 실패 시 안내
  const handleDownloadExcel = async () => {
    try {
      showAlert("전체 데이터를 다운로드 중입니다...", "info");
      const response = await axios.get(`${BACKEND_URL}/admin/${type}/export`, {
        params: { search },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showAlert("엑셀 파일이 다운로드되었습니다.");
    } catch (error) {
      showAlert("엑셀 다운로드는 관리자에게 문의하세요.", "error");
    }
  };

  // 조-그룹별 엑셀 다운로드
  const handleDownloadGroupExcel = async () => {
    try {
      showAlert("조-그룹별 엑셀을 생성 중입니다...", "info");
      
      // 전체 학생 데이터 조회 - 여러 세션을 시도해서 가장 많은 데이터를 가져오기
      let allStudents = [];
      
      // 다양한 세션에서 학생 데이터 시도
      const sessionsToTry = ['session1', 'day1_interview', 'day2_qt'];
      
      for (const session of sessionsToTry) {
        try {
          console.log(`👥 Trying to fetch students from ${session}...`);
          const response = await axios.get(`${BACKEND_URL}/attendance/${session}`, {
            params: { userTypes: 'student' }
          });
          
          const students = response.data || [];
          console.log(`✅ Found ${students.length} students in ${session}`);
          
          if (students.length > allStudents.length) {
            allStudents = students;
            console.log(`📊 Using ${session} as data source (${students.length} students)`);
          }
        } catch (error) {
          console.log(`⚠️ Failed to fetch from ${session}:`, error.message);
        }
      }
      
      if (allStudents.length === 0) {
        showAlert("다운로드할 학생 데이터가 없습니다. 학생이 등록되어 있는지 확인해주세요.", "warning");
        return;
      }
      
      console.log(`📋 Total students found: ${allStudents.length}`);
      
      // 레벨테스트 결과 조회
      let levelTestResults = [];
      try {
        console.log('📊 Fetching level test results...');
        const levelTestResponse = await axios.get(`${BACKEND_URL}/level-test/results`);
        levelTestResults = levelTestResponse.data || [];
        console.log(`✅ Found ${levelTestResults.length} level test results`);
      } catch (error) {
        console.log('⚠️ Failed to fetch level test results:', error.message);
        levelTestResults = [];
      }
      
      // 학생 데이터와 레벨테스트 결과 조인
      const studentsWithScores = allStudents.map(student => {
        const levelTest = levelTestResults.find(lt => lt.student_id === student.id);
        return {
          ...student,
          levelTest: levelTest || null,
          total_score: levelTest ? levelTest.total_score : null,
          max_score: levelTest ? levelTest.max_score : null,
          percentage: levelTest ? levelTest.percentage : null,
          test_date: levelTest ? levelTest.test_date : null
        };
      });
      
      console.log(`📊 Students with level test data: ${studentsWithScores.filter(s => s.levelTest).length}/${studentsWithScores.length}`);
      
      // 그룹-조 정보 확인 (디버깅)
      const groupStats = {};
      studentsWithScores.forEach(student => {
        const group = student.studentGroup || '미배정';
        const team = student.team || '미배정';
        const key = `${group}-${team}`;
        
        if (!groupStats[key]) {
          groupStats[key] = 0;
        }
        groupStats[key]++;
      });
      console.log('📊 Current group-team distribution:', groupStats);

      // 그룹과 조 정의
      const groups = ['KNOW', 'LOVE', 'SERVE', 'GLORY', 'HOLY', 'GRACE', 'HOPE'];
      const teams = [1, 2, 3, 4, 5];
      
      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      
      // 전체 요약 시트 데이터
      const summaryData = [];
      summaryData.push(['그룹', '조', '학생 수', '레벨테스트 완료', '평균 점수', '학생 명단']);
      
      let totalStudentsAssigned = 0;
      let sheetsCreated = 0;
      
      // 각 그룹-조별로 시트 생성
      groups.forEach(group => {
        teams.forEach(team => {
          const sheetName = `${group}-${team}조`;
          
          // 해당 그룹-조에 속한 학생들 필터링
          const studentsInTeam = studentsWithScores.filter(student => 
            student.studentGroup === group && 
            (student.team === team || student.team === `${team}`)
          );
          
          if (studentsInTeam.length > 0) {
            console.log(`📝 Creating sheet for ${group}-${team}조: ${studentsInTeam.length} students`);
            
            // 점수 순으로 정렬 (점수가 있는 학생 우선, 그 다음 이름순)
            studentsInTeam.sort((a, b) => {
              if (a.total_score && b.total_score) {
                return b.total_score - a.total_score; // 점수 높은 순
              } else if (a.total_score && !b.total_score) {
                return -1; // 점수 있는 학생 우선
              } else if (!a.total_score && b.total_score) {
                return 1; // 점수 있는 학생 우선
              } else {
                // 둘 다 점수 없으면 이름순
                const nameA = a.name || a.koreanName || '';
                const nameB = b.name || b.koreanName || '';
                return nameA.localeCompare(nameB);
              }
            });
            
            // 시트 데이터 준비 (점수 정보 포함)
            const sheetData = [];
            sheetData.push([
              '순위', '한글이름', '영어이름', '교회명', '교회번호', '성별', '옷사이즈', 
              '부모연락처', '특이사항', '레벨테스트 점수', '최대점수', '정답률(%)', '테스트일시'
            ]);
            
            studentsInTeam.forEach((student, index) => {
              // 순위 계산 (점수가 있는 학생만)
              let rank = '';
              if (student.total_score !== null) {
                const studentsWithScoresInTeam = studentsInTeam.filter(s => s.total_score !== null);
                const rankIndex = studentsWithScoresInTeam.findIndex(s => s.id === student.id);
                rank = rankIndex + 1;
              }
              
              sheetData.push([
                rank,
                student.name || student.koreanName || '',
                student.englishName || '',
                student.churchName || '',
                student.churchNumber || '',
                student.gender === 'male' ? '남자' : student.gender === 'female' ? '여자' : student.gender || '',
                student.shirtSize || '',
                student.parentContact || '',
                student.healthNotes || '',
                student.total_score !== null ? student.total_score : '미완료',
                student.max_score !== null ? student.max_score : '',
                student.percentage !== null ? `${student.percentage}%` : '',
                student.test_date ? new Date(student.test_date).toLocaleDateString() : ''
              ]);
            });
            
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            
            // 열 너비 설정 (점수 컬럼 추가)
            worksheet['!cols'] = [
              { width: 6 },   // 순위
              { width: 12 },  // 한글이름
              { width: 15 },  // 영어이름
              { width: 20 },  // 교회명
              { width: 12 },  // 교회번호
              { width: 8 },   // 성별
              { width: 10 },  // 옷사이즈
              { width: 15 },  // 부모연락처
              { width: 25 },  // 특이사항
              { width: 12 },  // 레벨테스트 점수
              { width: 10 },  // 최대점수
              { width: 12 },  // 정답률(%)
              { width: 12 }   // 테스트일시
            ];
            
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            totalStudentsAssigned += studentsInTeam.length;
            sheetsCreated++;
            
            // 요약 데이터에 추가 (레벨테스트 통계 포함)
            const studentsWithTest = studentsInTeam.filter(s => s.total_score !== null);
            const avgScore = studentsWithTest.length > 0 
              ? (studentsWithTest.reduce((sum, s) => sum + s.total_score, 0) / studentsWithTest.length).toFixed(1)
              : 0;
            const studentNames = studentsInTeam.map(s => s.name || s.koreanName).join(', ');
            
            summaryData.push([
              group, 
              `${team}조`, 
              studentsInTeam.length, 
              `${studentsWithTest.length}/${studentsInTeam.length}`,
              studentsWithTest.length > 0 ? `${avgScore}점` : '테스트 미완료',
              studentNames
            ]);
          } else {
            console.log(`⚪ ${group}-${team}조: 배정된 학생 없음`);
          }
        });
      });
      
      // 그룹-조에 배정되지 않은 학생들 체크
      const unassignedStudents = studentsWithScores.filter(student => 
        !student.studentGroup || 
        !student.team || 
        !groups.includes(student.studentGroup) || 
        !teams.includes(parseInt(student.team))
      );
      
      if (unassignedStudents.length > 0) {
        console.log(`⚠️ Found ${unassignedStudents.length} unassigned students`);
        
        // 미배정 학생들도 점수순으로 정렬
        unassignedStudents.sort((a, b) => {
          if (a.total_score && b.total_score) {
            return b.total_score - a.total_score;
          } else if (a.total_score && !b.total_score) {
            return -1;
          } else if (!a.total_score && b.total_score) {
            return 1;
          } else {
            const nameA = a.name || a.koreanName || '';
            const nameB = b.name || b.koreanName || '';
            return nameA.localeCompare(nameB);
          }
        });
        
        const sheetData = [];
        sheetData.push([
          '순위', '한글이름', '영어이름', '교회명', '교회번호', '현재그룹', '현재조', 
          '상태', '레벨테스트 점수', '정답률(%)', '테스트일시'
        ]);
        
        unassignedStudents.forEach((student, index) => {
          let rank = '';
          if (student.total_score !== null) {
            const studentsWithScoresUnassigned = unassignedStudents.filter(s => s.total_score !== null);
            const rankIndex = studentsWithScoresUnassigned.findIndex(s => s.id === student.id);
            rank = rankIndex + 1;
          }
          
          sheetData.push([
            rank,
            student.name || student.koreanName || '',
            student.englishName || '',
            student.churchName || '',
            student.churchNumber || '',
            student.studentGroup || '미배정',
            student.team || '미배정',
            '그룹-조 미배정',
            student.total_score !== null ? student.total_score : '미완료',
            student.percentage !== null ? `${student.percentage}%` : '',
            student.test_date ? new Date(student.test_date).toLocaleDateString() : ''
          ]);
        });
        
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        worksheet['!cols'] = [
          { width: 6 }, { width: 12 }, { width: 15 }, { width: 20 }, 
          { width: 12 }, { width: 12 }, { width: 8 }, { width: 15 },
          { width: 12 }, { width: 12 }, { width: 12 }
        ];
        
        XLSX.utils.book_append_sheet(workbook, worksheet, '미배정학생');
        sheetsCreated++;
        
        // 미배정 학생 통계
        const unassignedWithTest = unassignedStudents.filter(s => s.total_score !== null);
        const unassignedAvgScore = unassignedWithTest.length > 0 
          ? (unassignedWithTest.reduce((sum, s) => sum + s.total_score, 0) / unassignedWithTest.length).toFixed(1)
          : 0;
        
        summaryData.push([
          '미배정', 
          '-', 
          unassignedStudents.length, 
          `${unassignedWithTest.length}/${unassignedStudents.length}`,
          unassignedWithTest.length > 0 ? `${unassignedAvgScore}점` : '테스트 미완료',
          '그룹-조 미배정 학생들'
        ]);
      }
      
      // 요약 시트 완성
      summaryData.push([]); // 빈 줄
      summaryData.push(['전체 통계', '', '', '', '', '']);
      summaryData.push(['총 학생 수', studentsWithScores.length, '', '', '', '']);
      summaryData.push(['배정된 학생 수', totalStudentsAssigned, '', '', '', '']);
      summaryData.push(['미배정 학생 수', unassignedStudents.length, '', '', '', '']);
      summaryData.push(['레벨테스트 완료', studentsWithScores.filter(s => s.total_score !== null).length, '', '', '', '']);
      summaryData.push(['레벨테스트 미완료', studentsWithScores.filter(s => s.total_score === null).length, '', '', '', '']);
      summaryData.push(['생성된 시트 수', sheetsCreated, '', '', '', '']);
      
      // 전체 평균 점수
      const allWithTest = studentsWithScores.filter(s => s.total_score !== null);
      const overallAvgScore = allWithTest.length > 0 
        ? (allWithTest.reduce((sum, s) => sum + s.total_score, 0) / allWithTest.length).toFixed(1)
        : 0;
      summaryData.push(['전체 평균 점수', allWithTest.length > 0 ? `${overallAvgScore}점` : '테스트 미완료', '', '', '', '']);
      
      const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWorksheet['!cols'] = [
        { width: 15 }, { width: 10 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 50 }
      ];
      
      // 요약 시트를 맨 앞에 추가
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '📊 전체요약');
      
      // 시트 순서 재정렬 (요약을 맨 앞으로)
      const sheetNames = ['📊 전체요약'];
      groups.forEach(group => {
        teams.forEach(team => {
          const sheetName = `${group}-${team}조`;
          if (workbook.Sheets[sheetName]) {
            sheetNames.push(sheetName);
          }
        });
      });
      if (workbook.Sheets['미배정학생']) {
        sheetNames.push('미배정학생');
      }
      workbook.SheetNames = sheetNames;
      
      // 파일 다운로드
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AWANA_학생_조그룹별_명단_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      const completedTests = studentsWithScores.filter(s => s.total_score !== null).length;
      showAlert(
        `조-그룹별 엑셀 파일이 생성되었습니다! (총 ${sheetsCreated}개 시트, ${totalStudentsAssigned}명 배정됨, 레벨테스트 완료 ${completedTests}명)`, 
        "success"
      );
      
    } catch (error) {
      console.error('Error creating group Excel:', error);
      showAlert(`조-그룹별 엑셀 생성 중 오류가 발생했습니다: ${error.message}`, "error");
    }
  };

  // 레벨테스트 기반 조-그룹 재배정
  const handleLevelTestRedistribute = async () => {
    try {
      if (!window.confirm("레벨테스트 점수를 기반으로 모든 학생의 조-그룹을 재배정하시겠습니까?\n\n⚠️ 주의: 기존 조-그룹 배정이 모두 변경됩니다!")) {
        return;
      }
      
      showAlert("레벨테스트 기반 조-그룹 재배정을 시작합니다...", "info");
      
      const response = await axios.post(`${BACKEND_URL}/level-test/redistribute`);
      
      if (response.data.success) {
        showAlert("레벨테스트 점수를 기반으로 조-그룹 재배정이 완료되었습니다!", "success");
        // 학생 데이터 새로고침
        if (type === "students") {
          fetchData();
        }
      } else {
        showAlert("재배정 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      console.error('Error redistributing students:', error);
      const errorMessage = error.response?.data?.error || error.message || "재배정 중 오류가 발생했습니다.";
      showAlert(`레벨테스트 재배정 실패: ${errorMessage}`, "error");
    }
  };

  // 암송핀 완료 학생 엑셀 다운로드
  const handleDownloadRecitationPinExcel = async () => {
    try {
      showAlert("암송핀 완료 학생 엑셀을 생성 중입니다...", "info");
      
      // 스탬프 데이터 조회 (순위 API 사용)
      const response = await axios.get(`${BACKEND_URL}/stamps/rankings`);
      let stampData = response.data || [];
      
      // 데이터 구조 확인 및 배열로 변환
      if (!Array.isArray(stampData)) {
        console.log('🔍 Stamp data is not array, checking structure:', typeof stampData);
        if (stampData.data && Array.isArray(stampData.data)) {
          stampData = stampData.data;
        } else if (stampData.results && Array.isArray(stampData.results)) {
          stampData = stampData.results;
        } else {
          console.error('❌ Unexpected stamp data structure:', stampData);
          stampData = [];
        }
      }
      
      console.log(`📊 Found ${stampData.length} stamp records`);
      
      if (stampData.length === 0) {
        showAlert("다운로드할 스탬프 데이터가 없습니다.", "warning");
        return;
      }

      // 암송핀 완료 학생들 필터링
      const koreanPinStudents = stampData.filter(item => item.korean_pin_complete);
      const englishPinStudents = stampData.filter(item => item.english_pin_complete);
      const bothPinStudents = stampData.filter(item => item.korean_pin_complete && item.english_pin_complete);

      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      
      // 1. 한글 암송핀 완료 시트
      const koreanPinData = [];
      koreanPinData.push(['순번', '학생명', '영어명', '교회명', '그룹', '조', '스탬프수', '완료일시']);
      koreanPinStudents
        .sort((a, b) => (a.koreanName || '').localeCompare(b.koreanName || ''))
        .forEach((item, index) => {
          koreanPinData.push([
            index + 1,
            item.koreanName || '',
            item.englishName || '',
            item.churchName || '',
            item.studentGroup || '',
            item.team || '',
            item.stamp_count || 0,
            item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''
          ]);
        });
      
      const koreanWorksheet = XLSX.utils.aoa_to_sheet(koreanPinData);
      koreanWorksheet['!cols'] = [
        { width: 6 }, { width: 12 }, { width: 15 }, { width: 20 }, 
        { width: 10 }, { width: 6 }, { width: 10 }, { width: 12 }
      ];
      XLSX.utils.book_append_sheet(workbook, koreanWorksheet, '🇰🇷 한글암송핀완료');

      // 2. 영어 암송핀 완료 시트
      const englishPinData = [];
      englishPinData.push(['순번', '학생명', '영어명', '교회명', '그룹', '조', '스탬프수', '완료일시']);
      englishPinStudents
        .sort((a, b) => (a.koreanName || '').localeCompare(b.koreanName || ''))
        .forEach((item, index) => {
          englishPinData.push([
            index + 1,
            item.koreanName || '',
            item.englishName || '',
            item.churchName || '',
            item.studentGroup || '',
            item.team || '',
            item.stamp_count || 0,
            item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''
          ]);
        });
      
      const englishWorksheet = XLSX.utils.aoa_to_sheet(englishPinData);
      englishWorksheet['!cols'] = [
        { width: 6 }, { width: 12 }, { width: 15 }, { width: 20 }, 
        { width: 10 }, { width: 6 }, { width: 10 }, { width: 12 }
      ];
      XLSX.utils.book_append_sheet(workbook, englishWorksheet, '🇺🇸 영어암송핀완료');

      // 3. 한글+영어 모두 완료 시트
      const bothPinData = [];
      bothPinData.push(['순번', '학생명', '영어명', '교회명', '그룹', '조', '스탬프수', '완료일시']);
      bothPinStudents
        .sort((a, b) => (a.koreanName || '').localeCompare(b.koreanName || ''))
        .forEach((item, index) => {
          bothPinData.push([
            index + 1,
            item.koreanName || '',
            item.englishName || '',
            item.churchName || '',
            item.studentGroup || '',
            item.team || '',
            item.stamp_count || 0,
            item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''
          ]);
        });
      
      const bothWorksheet = XLSX.utils.aoa_to_sheet(bothPinData);
      bothWorksheet['!cols'] = [
        { width: 6 }, { width: 12 }, { width: 15 }, { width: 20 }, 
        { width: 10 }, { width: 6 }, { width: 10 }, { width: 12 }
      ];
      XLSX.utils.book_append_sheet(workbook, bothWorksheet, '🏆 한글영어모두완료');

      // 4. 요약 시트
      const summaryData = [];
      summaryData.push(['📊 암송핀 완료 현황 요약', '', '', '']);
      summaryData.push([]);
      summaryData.push(['구분', '완료 학생 수', '비율', '']);
      summaryData.push(['한글 암송핀 완료', koreanPinStudents.length, `${((koreanPinStudents.length / stampData.length) * 100).toFixed(1)}%`, '']);
      summaryData.push(['영어 암송핀 완료', englishPinStudents.length, `${((englishPinStudents.length / stampData.length) * 100).toFixed(1)}%`, '']);
      summaryData.push(['한글+영어 모두 완료', bothPinStudents.length, `${((bothPinStudents.length / stampData.length) * 100).toFixed(1)}%`, '']);
      summaryData.push(['총 참가 학생', stampData.length, '100%', '']);
      summaryData.push([]);
      
      // 그룹별 통계
      summaryData.push(['📈 그룹별 암송핀 완료 현황', '', '', '']);
      summaryData.push(['그룹', '한글완료', '영어완료', '모두완료']);
      
      const groups = ['KNOW', 'LOVE', 'SERVE', 'GLORY', 'HOLY', 'GRACE', 'HOPE'];
      groups.forEach(group => {
        const groupData = stampData.filter(item => item.studentGroup === group);
        const koreanCount = groupData.filter(item => item.korean_pin_complete).length;
        const englishCount = groupData.filter(item => item.english_pin_complete).length;
        const bothCount = groupData.filter(item => item.korean_pin_complete && item.english_pin_complete).length;
        
        summaryData.push([
          `${groups.indexOf(group) + 1}그룹-${group}`,
          `${koreanCount}명`,
          `${englishCount}명`,
          `${bothCount}명`
        ]);
      });
      
      const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWorksheet['!cols'] = [
        { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }
      ];
      
      // 요약을 맨 앞에 추가
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '📊 요약');
      
      // 시트 순서 재정렬
      workbook.SheetNames = ['📊 요약', '🏆 한글영어모두완료', '🇰🇷 한글암송핀완료', '🇺🇸 영어암송핀완료'];
      
      // 파일 다운로드
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AWANA_암송핀_완료현황_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showAlert(
        `암송핀 완료 현황 엑셀이 생성되었습니다! (한글: ${koreanPinStudents.length}명, 영어: ${englishPinStudents.length}명, 모두완료: ${bothPinStudents.length}명)`, 
        "success"
      );
      
    } catch (error) {
      console.error('Error creating recitation pin Excel:', error);
      showAlert(`암송핀 엑셀 생성 중 오류가 발생했습니다: ${error.message}`, "error");
    }
  };

  // 스탬프 순위별 엑셀 다운로드
  const handleDownloadStampRankingExcel = async () => {
    try {
      showAlert("스탬프 순위별 엑셀을 생성 중입니다...", "info");
      
      // 스탬프 순위 데이터 조회 - 뷰를 사용하여 전체 순위와 그룹별 순위 포함
      const response = await axios.get(`${BACKEND_URL}/stamps/rankings`);
      const rankingData = response.data || [];
      
      console.log(`📊 Found ${rankingData.length} stamp ranking records`);
      
      if (rankingData.length === 0) {
        showAlert("다운로드할 스탬프 데이터가 없습니다.", "warning");
        return;
      }

      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      
      // 1. 전체 순위 시트
      const overallRankingData = [];
      overallRankingData.push([
        '전체순위', '학생명', '영어명', '교회명', '그룹', '조', '스탬프수', 
        '한글완성', '영어완성', '스탬프점수', '전체상'
      ]);
      
      // 전체 순위로 정렬 (스탬프 개수 기준)
      const sortedOverall = rankingData
        .sort((a, b) => (b.stamp_count || 0) - (a.stamp_count || 0));
      
      // MVP 컷오프 계산
      const totalStudents = sortedOverall.length;
      const mvpCutoff = Math.ceil(totalStudents * 0.1);
      
      sortedOverall.forEach((item, index) => {
        const rank = index + 1;
        const isMVP = rank <= mvpCutoff;
        overallRankingData.push([
          rank,
          item.koreanName || '',
          item.englishName || '',
          item.churchName || '',
          item.studentGroup || '',
          item.team || '',
          item.stamp_count || 0,
          item.korean_pin_complete ? 'O' : 'X',
          item.english_pin_complete ? 'O' : 'X',
          item.stamp_count || 0, // 스탬프 개수가 곧 점수
          isMVP ? 'MVP' : ''
        ]);
      });
      
      const overallWorksheet = XLSX.utils.aoa_to_sheet(overallRankingData);
      overallWorksheet['!cols'] = [
        { width: 8 }, { width: 12 }, { width: 15 }, { width: 20 }, 
        { width: 10 }, { width: 6 }, { width: 10 }, { width: 8 }, 
        { width: 8 }, { width: 8 }, { width: 10 }
      ];
      XLSX.utils.book_append_sheet(workbook, overallWorksheet, '📈 전체순위');
      
      // 2. 그룹별 순위 시트들 (조별 평균 기준)
      const groups = ['KNOW', 'LOVE', 'SERVE', 'GLORY', 'HOLY', 'GRACE', 'HOPE'];
      
      groups.forEach(group => {
        const groupData = rankingData.filter(item => item.studentGroup === group);
        
        if (groupData.length > 0) {
          // 조별 평균 계산
          const teams = [1, 2, 3, 4, 5];
          const teamAverages = [];
          
          teams.forEach(team => {
            const teamStudents = groupData.filter(item => 
              item.team === team || item.team === `${team}`
            );
            
            if (teamStudents.length > 0) {
              // 스탬프 개수가 0보다 큰 학생들만 평균 계산에 포함
              const studentsWithStamps = teamStudents.filter(student => 
                (student.stamp_count || 0) > 0
              );
              
              let average = 0;
              if (studentsWithStamps.length > 0) {
                const totalStamps = studentsWithStamps.reduce((sum, student) => 
                  sum + (student.stamp_count || 0), 0
                );
                average = totalStamps / studentsWithStamps.length;
              }
              
              teamAverages.push({
                team: team,
                totalStudents: teamStudents.length,
                studentsWithStamps: studentsWithStamps.length,
                totalStamps: teamStudents.reduce((sum, student) => sum + (student.stamp_count || 0), 0),
                average: average,
                students: teamStudents
              });
            }
          });
          
          // 조별 평균으로 정렬 (평균 높은 순)
          teamAverages.sort((a, b) => b.average - a.average);
          
          const groupSheetData = [];
          groupSheetData.push([
            '조순위', '조', '조원수', '스탬프보유자', '조스탬프합계', '조평균', '상격'
          ]);
          groupSheetData.push([]); // 빈 줄
          
          // 조별 순위 및 상격 결정
          teamAverages.forEach((teamData, index) => {
            const teamRank = index + 1;
            let teamAward = '';
            if (teamRank === 1) teamAward = '금';
            else if (teamRank === 2) teamAward = '은';
            else if (teamRank <= 5) teamAward = '동';
            
            groupSheetData.push([
              teamRank,
              `${teamData.team}조`,
              teamData.totalStudents,
              teamData.studentsWithStamps,
              teamData.totalStamps,
              teamData.average.toFixed(2),
              teamAward
            ]);
          });
          
          groupSheetData.push([]); // 빈 줄
          groupSheetData.push(['세부 학생 명단', '', '', '', '', '', '']);
          groupSheetData.push([
            '조', '학생명', '영어명', '교회명', '스탬프수', '한글완성', '영어완성'
          ]);
          
          // 조별로 학생 명단 추가 (순위 순으로)
          teamAverages.forEach(teamData => {
            // 해당 조 학생들을 스탬프 개수 순으로 정렬
            const sortedStudents = teamData.students.sort((a, b) => 
              (b.stamp_count || 0) - (a.stamp_count || 0)
            );
            
            sortedStudents.forEach(student => {
              groupSheetData.push([
                `${teamData.team}조`,
                student.koreanName || '',
                student.englishName || '',
                student.churchName || '',
                student.stamp_count || 0,
                student.korean_pin_complete ? 'O' : 'X',
                student.english_pin_complete ? 'O' : 'X'
              ]);
            });
          });
          
          const groupWorksheet = XLSX.utils.aoa_to_sheet(groupSheetData);
          groupWorksheet['!cols'] = [
            { width: 8 }, { width: 8 }, { width: 8 }, { width: 12 }, 
            { width: 12 }, { width: 10 }, { width: 8 }
          ];
          
          const groupNumber = groups.indexOf(group) + 1;
          XLSX.utils.book_append_sheet(workbook, groupWorksheet, `${groupNumber}그룹-${group}`);
        }
      });
      
      // 3. 수상자 요약 시트
      const awardSummaryData = [];
      awardSummaryData.push(['구분', '수상조', '대표학생', '조원정보', '그룹', '조', '총스탬프', '상격']);
      awardSummaryData.push([]); // 빈 줄
      
      // MVP (전체 상위 10% - 스탬프 개수 기준)
      const mvpStudents = sortedOverall.slice(0, mvpCutoff);
      if (mvpStudents.length > 0) {
        awardSummaryData.push(['🏆 MVP (상위 10%)', '', '', '', '', '', '', '']);
        mvpStudents.forEach((item, index) => {
          awardSummaryData.push([
            `${index + 1}위`,
            item.koreanName || '',
            item.englishName || '',
            item.churchName || '',
            item.studentGroup || '',
            item.team || '',
            item.stamp_count || 0,
            'MVP'
          ]);
        });
        awardSummaryData.push([]); // 빈 줄
      }
      
      // 그룹별 수상자 (조별 평균 기준)
      groups.forEach(group => {
        const groupData = rankingData.filter(item => item.studentGroup === group);
        
        if (groupData.length > 0) {
          // 조별 평균 계산
          const teams = [1, 2, 3, 4, 5];
          const teamAverages = [];
          
          teams.forEach(team => {
            const teamStudents = groupData.filter(item => 
              item.team === team || item.team === `${team}`
            );
            
            if (teamStudents.length > 0) {
              // 스탬프 개수가 0보다 큰 학생들만 평균 계산에 포함
              const studentsWithStamps = teamStudents.filter(student => 
                (student.stamp_count || 0) > 0
              );
              
              let average = 0;
              if (studentsWithStamps.length > 0) {
                const totalStamps = studentsWithStamps.reduce((sum, student) => 
                  sum + (student.stamp_count || 0), 0
                );
                average = totalStamps / studentsWithStamps.length;
              }
              
              teamAverages.push({
                team: team,
                totalStudents: teamStudents.length,
                studentsWithStamps: studentsWithStamps.length,
                totalStamps: teamStudents.reduce((sum, student) => sum + (student.stamp_count || 0), 0),
                average: average,
                students: teamStudents
              });
            }
          });
          
          // 조별 평균으로 정렬 (평균 높은 순)
          teamAverages.sort((a, b) => b.average - a.average);
          
          // 각 그룹에서 상위 5개 조가 수상 (1등:금, 2등:은, 3-5등:동)
          const teamWinners = teamAverages.slice(0, 5);
          
          if (teamWinners.length > 0) {
            const groupNumber = groups.indexOf(group) + 1;
            awardSummaryData.push([`🏅 ${groupNumber}그룹 (${group}) 수상조`, '', '', '', '', '', '', '']);
            
            teamWinners.forEach((teamData, index) => {
              const teamRank = index + 1;
              let teamAward = '';
              if (teamRank === 1) teamAward = '금';
              else if (teamRank === 2) teamAward = '은';
              else if (teamRank <= 5) teamAward = '동';
              
              // 해당 조의 대표 학생 (스탬프가 가장 많은 학생) 정보 가져오기
              const topStudent = teamData.students.sort((a, b) => 
                (b.stamp_count || 0) - (a.stamp_count || 0)
              )[0];
              
              awardSummaryData.push([
                `${teamRank}위`,
                `${teamData.team}조 (평균: ${teamData.average.toFixed(2)})`,
                `대표: ${topStudent?.koreanName || ''}`,
                `조원 ${teamData.totalStudents}명`,
                group,
                `${teamData.team}조`,
                teamData.totalStamps,
                teamAward
              ]);
            });
            awardSummaryData.push([]); // 빈 줄
          }
        }
      });
      
      // 통계 추가
      awardSummaryData.push(['📊 수상 통계', '', '', '', '', '', '', '']);
      // 그룹별 수상조 통계 계산 (조별 평균 기준)
      let goldCount = 0, silverCount = 0, bronzeCount = 0;
      groups.forEach(group => {
        const groupData = rankingData.filter(item => item.studentGroup === group);
        
        if (groupData.length > 0) {
          // 조별 평균 계산
          const teams = [1, 2, 3, 4, 5];
          const teamAverages = [];
          
          teams.forEach(team => {
            const teamStudents = groupData.filter(item => 
              item.team === team || item.team === `${team}`
            );
            
            if (teamStudents.length > 0) {
              const studentsWithStamps = teamStudents.filter(student => 
                (student.stamp_count || 0) > 0
              );
              
              let average = 0;
              if (studentsWithStamps.length > 0) {
                const totalStamps = studentsWithStamps.reduce((sum, student) => 
                  sum + (student.stamp_count || 0), 0
                );
                average = totalStamps / studentsWithStamps.length;
              }
              
              teamAverages.push({ team, average });
            }
          });
          
          // 조별 평균으로 정렬
          teamAverages.sort((a, b) => b.average - a.average);
          
          // 각 그룹에서 수상조 카운트
          if (teamAverages.length >= 1) goldCount++; // 각 그룹 1등조: 금
          if (teamAverages.length >= 2) silverCount++; // 각 그룹 2등조: 은  
          if (teamAverages.length >= 3) {
            bronzeCount += Math.min(3, teamAverages.length - 2); // 각 그룹 3-5등조: 동 (최대 3조)
          }
        }
      });
      
      awardSummaryData.push(['MVP 수상자 (개인)', mvpStudents.length, '명', '', '', '', '', '']);
      awardSummaryData.push(['금상 수상조', goldCount, '조', '', '', '', '', '']);
      awardSummaryData.push(['은상 수상조', silverCount, '조', '', '', '', '', '']);
      awardSummaryData.push(['동상 수상조', bronzeCount, '조', '', '', '', '', '']);
      awardSummaryData.push(['총 참가자', rankingData.length, '명', '', '', '', '', '']);
      
      const awardSummaryWorksheet = XLSX.utils.aoa_to_sheet(awardSummaryData);
      awardSummaryWorksheet['!cols'] = [
        { width: 20 }, { width: 20 }, { width: 15 }, { width: 15 }, 
        { width: 10 }, { width: 8 }, { width: 12 }, { width: 10 }
      ];
      
      // 수상자 요약을 맨 앞에 추가
      XLSX.utils.book_append_sheet(workbook, awardSummaryWorksheet, '🏆 수상자요약');
      
      // 시트 순서 재정렬
      const sheetNames = ['🏆 수상자요약', '📈 전체순위'];
      groups.forEach(group => {
        const groupNumber = groups.indexOf(group) + 1;
        const sheetName = `${groupNumber}그룹-${group}`;
        if (workbook.Sheets[sheetName]) {
          sheetNames.push(sheetName);
        }
      });
      workbook.SheetNames = sheetNames;
      
      // 파일 다운로드
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AWANA_스탬프_순위별_수상자_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showAlert(
        `스탬프 순위별 엑셀 파일이 생성되었습니다! (MVP ${mvpStudents.length}명, 금상 ${goldCount}조, 은상 ${silverCount}조, 동상 ${bronzeCount}조)`, 
        "success"
      );
      
    } catch (error) {
      console.error('Error creating stamp ranking Excel:', error);
      showAlert(`스탬프 순위별 엑셀 생성 중 오류가 발생했습니다: ${error.message}`, "error");
    }
  };

  const getColumns = () => {
    switch (type) {
      case "students":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "한글이름", key: "koreanName" },
          { displayName: "영어이름", key: "englishName" },
          { displayName: "교회명", key: "churchName" },
          { displayName: "교회등록번호", key: "churchNumber" },
          { displayName: "부모연락처", key: "parentContact" },
          { displayName: "특이사항", key: "healthNotes" },
          { displayName: "옷사이즈", key: "shirtSize" },
          { displayName: "성별", key: "gender" },
          { displayName: "그룹", key: "studentGroup" },
          { displayName: "조", key: "team" }
        ];
      case "ym":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "이름", key: "name" },
          { displayName: "영어이름", key: "englishName" },
          { displayName: "교회등록번호", key: "churchNumber" },
          { displayName: "교회명", key: "churchName" },
          { displayName: "성별", key: "gender" },
          { displayName: "클럽", key: "awanaRole" },
          { displayName: "학년", key: "position" },
          { displayName: "연락처", key: "contact" },
          { displayName: "옷사이즈", key: "shirtSize" },
        ];
      case "teachers":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "이름", key: "name" },
          { displayName: "영어이름", key: "englishName" },
          { displayName: "교회등록번호", key: "churchNumber" },
          { displayName: "교회명", key: "churchName" },
          { displayName: "성별", key: "gender" },
          { displayName: "어와나 역할", key: "awanaRole" },
          { displayName: "직분", key: "position" },
          { displayName: "연락처", key: "contact" },
          { displayName: "옷사이즈", key: "shirtSize" },
        ];
      case "staff":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "이름", key: "name" },
          { displayName: "영어이름", key: "englishName" },
          { displayName: "교회등록번호", key: "churchNumber" },
          { displayName: "교회명", key: "churchName" },
          { displayName: "성별", key: "gender" },
          { displayName: "어와나 역할", key: "awanaRole" },
          { displayName: "직분", key: "position" },
          { displayName: "연락처", key: "contact" },
          { displayName: "옷사이즈", key: "shirtSize" },
        ];
      case "churches":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "교회명", key: "name" },
          { displayName: "교회등록번호", key: "churchNumber" },
          { displayName: "담당자명", key: "contactPerson" },
          { displayName: "연락처", key: "contact" },
          { displayName: "이메일", key: "email" },
          { displayName: "주소", key: "address" },
          { displayName: "등록일", key: "created_at" },
        ];
      case "scores":
        return [
          { displayName: "ID", key: "id" },
          { displayName: "학생 ID", key: "student_id" },
          { displayName: "질문 1", key: "question1" },
          { displayName: "질문 2", key: "question2" },
          { displayName: "질문 3", key: "question3" },
          { displayName: "질문 4", key: "question4" },
          { displayName: "질문 5", key: "question5" },
          { displayName: "질문 6", key: "question6" },
          { displayName: "질문 7", key: "question7" },
          { displayName: "질문 8", key: "question8" },
          { displayName: "질문 9", key: "question9" },
          { displayName: "총점", key: "total" },
          { displayName: "등급", key: "rank" },
        ];
      case "stamps":
        return [
          { displayName: "ID", key: "id", readOnly: true },
          { displayName: "학생 ID", key: "student_id", readOnly: true },
          { displayName: "학생명", key: "koreanName", readOnly: true },
          { displayName: "영어명", key: "englishName", readOnly: true },
          { displayName: "교회명", key: "churchName", readOnly: true },
          { displayName: "그룹", key: "studentGroup", readOnly: true },
          { displayName: "조", key: "team", readOnly: true },
          { displayName: "스탬프 개수", key: "stamp_count" },
          { displayName: "한글완성", key: "korean_pin_complete" },
          { displayName: "영어완성", key: "english_pin_complete" },
          { displayName: "스탬프점수", key: "stamp_count", readOnly: true },
          { displayName: "전체순위", key: "overall_rank", readOnly: true },
          { displayName: "전체상", key: "overall_award", readOnly: true },
          { displayName: "그룹순위", key: "group_rank", readOnly: true },
          { displayName: "그룹상", key: "group_award", readOnly: true },
        ];
      default:
        return [];
    }
  };
    
  const formatCellValue = (item, column) => {
    if (column.key === 'gender') {
      return item[column.key] === 'male' ? '남자' : item[column.key] === 'female' ? '여자' : item[column.key];
    }
    if (column.key === 'korean_pin_complete' || column.key === 'english_pin_complete') {
      return item[column.key] ? 'O' : 'X';
    }
    return item[column.key];
  };

  const getTypeDisplayName = (type) => {
    const typeNames = {
      students: "학생",
      ym: "YM",
      teachers: "교사",
      staff: "스태프",
      churches: "교회",
      attendance: "출석",
      scores: "성적",
      stamps: "스탬프"
    };
    return typeNames[type] || type;
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
            AWANA Camp 관리자 페이지
          </Typography>
          <Chip 
            label={getTypeDisplayName(type)} 
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

      {/* Controls */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>카테고리</InputLabel>
              <Select
                value={type}
                label="카테고리"
                onChange={handleTypeChange}
              >
                <MenuItem value="students">학생</MenuItem>
                <MenuItem value="ym">YM</MenuItem>
                <MenuItem value="teachers">교사</MenuItem>
                <MenuItem value="staff">스태프</MenuItem>
                <MenuItem value="churches">교회</MenuItem>
                <MenuItem value="attendance">출석</MenuItem>
                <MenuItem value="scores">성적</MenuItem>
                <MenuItem value="stamps">스탬프</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={handleSearch}>
                    <Search />
                  </IconButton>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>표시 개수</InputLabel>
              <Select
                value={limit}
                label="표시 개수"
                onChange={handleLimitChange}
              >
                <MenuItem value={30}>30개</MenuItem>
                <MenuItem value={50}>50개</MenuItem>
                <MenuItem value={100}>100개</MenuItem>
                <MenuItem value={500}>500개</MenuItem>
                <MenuItem value={1000}>1000개</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchData}
                size="small"
                disabled={loading}
              >
                새로고침
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadExcel}
                size="small"
                disabled={loading}
              >
                엑셀 다운로드
              </Button>
              {type === "students" && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Group />}
                    onClick={handleDownloadGroupExcel}
                    size="small"
                    disabled={loading}
                    color="secondary"
                  >
                    조-그룹별 엑셀
                  </Button>
                  {/* <Button
                    variant="outlined"
                    startIcon={<EmojiEvents />}
                    onClick={handleLevelTestRedistribute}
                    size="small"
                    disabled={loading}
                    color="warning"
                    sx={{ 
                      borderColor: 'warning.main',
                      color: 'warning.main',
                      '&:hover': {
                        borderColor: 'warning.dark',
                        backgroundColor: 'warning.light'
                      }
                    }}
                  >
                    레벨테스트 재배정
                  </Button> */}
                </>
              )}
              {type === "stamps" && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EmojiEvents />}
                    onClick={handleDownloadStampRankingExcel}
                    size="small"
                    disabled={loading}
                    color="warning"
                    sx={{ 
                      borderColor: 'warning.main',
                      color: 'warning.main',
                      '&:hover': {
                        borderColor: 'warning.dark',
                        backgroundColor: 'warning.light'
                      }
                    }}
                  >
                    순위별 수상자 엑셀
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Group />}
                    onClick={handleDownloadRecitationPinExcel}
                    size="small"
                    disabled={loading}
                    color="success"
                    sx={{ 
                      borderColor: 'success.main',
                      color: 'success.main',
                      '&:hover': {
                        borderColor: 'success.dark',
                        backgroundColor: 'success.light'
                      }
                    }}
                  >
                    암송핀 완료 엑셀
                  </Button>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table */}
      <Paper elevation={2}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {getColumns().map((column) => (
                  <TableCell key={column.key} sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                    {column.displayName}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                  작업
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={getColumns().length + 1} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      데이터를 불러오는 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={getColumns().length + 1} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      데이터가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} hover>
                    {getColumns().map((column) => (
                      <TableCell key={column.key}>
                        {formatCellValue(item, column)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              총 {totalCount}개 중 {limit === 'all' ? `1-${totalCount}` : `${((page - 1) * limit) + 1}-${Math.min(page * limit, totalCount)}`}개 표시
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              disabled={loading}
            />
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {getTypeDisplayName(type)} 정보 수정
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              {getColumns()
                .filter(column => !['created_at', 'updated_at', 'qrCode'].includes(column.key))
                .map((column) => (
                  <Grid item xs={12} sm={6} key={column.key}>
                    {column.key === 'gender' ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{column.displayName}</InputLabel>
                        <Select
                          name={column.key}
                          value={editData[column.key] || ""}
                          label={column.displayName}
                          onChange={handleEditChange}
                        >
                          <MenuItem value="">선택하세요</MenuItem>
                          <MenuItem value="남자">남자</MenuItem>
                          <MenuItem value="여자">여자</MenuItem>
                        </Select>
                      </FormControl>
                    ) : column.key === 'awanaRole' && (type === 'ym') ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{column.displayName}</InputLabel>
                        <Select
                          name={column.key}
                          value={editData[column.key] || ""}
                          label={column.displayName}
                          onChange={handleEditChange}
                        >
                          <MenuItem value="">선택하세요</MenuItem>
                          <MenuItem value="TREK">TREK</MenuItem>
                          <MenuItem value="JOURNEY">JOURNEY</MenuItem>
                        </Select>
                      </FormControl>
                    ) : column.key === 'position' && (type === 'ym') ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{column.displayName}</InputLabel>
                        <Select
                          name={column.key}
                          value={editData[column.key] || ""}
                          label={column.displayName}
                          onChange={handleEditChange}
                        >
                          <MenuItem value="">선택하세요</MenuItem>
                          <MenuItem value="1학년">1학년</MenuItem>
                          <MenuItem value="2학년">2학년</MenuItem>
                          <MenuItem value="3학년">3학년</MenuItem>
                        </Select>
                      </FormControl>
                    ) : column.key === 'shirtSize' ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{column.displayName}</InputLabel>
                        <Select
                          name={column.key}
                          value={editData[column.key] || ""}
                          label={column.displayName}
                          onChange={handleEditChange}
                        >
                          <MenuItem value="">선택하세요</MenuItem>
                          <MenuItem value="XS">XS</MenuItem>
                          <MenuItem value="S">S</MenuItem>
                          <MenuItem value="M">M</MenuItem>
                          <MenuItem value="L">L</MenuItem>
                          <MenuItem value="XL">XL</MenuItem>
                          <MenuItem value="2XL">2XL</MenuItem>
                          <MenuItem value="3XL">3XL</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        label={column.displayName}
                        name={column.key}
                        value={editData[column.key] || ""}
                        onChange={handleEditChange}
                        disabled={column.key === 'id' || column.readOnly}
                      />
                    )}
                  </Grid>
                ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditItem(null)}>
            취소
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            color="primary"
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;
