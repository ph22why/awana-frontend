import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  Chip,
  Grid,
  Toolbar,
  AppBar,
  Stack,
  Alert
} from '@mui/material';
import {
  Search,
  Download,
  Home,
  Refresh,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { BACKEND_URL } from "../config";

const AttendanceCheckAdminPage = () => {
  const [search, setSearch] = useState("");
  const [day, setDay] = useState("");
  const [session, setSession] = useState("");
  const [group, setGroup] = useState("");
  const [team, setTeam] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const navigate = useNavigate();

  useEffect(() => {
    handleSearch();
  }, []);

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setTimeout(() => setAlertMessage(""), 5000);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/attendance`, {
        params: { search, day, session, group, team },
      });
      setAttendanceData(response.data);
      calculateSummary(response.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      showAlert("출석 데이터를 불러오는데 실패했습니다.", "error");
    }
  };

  const calculateSummary = (data) => {
    const summary = {};
    data.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "id" && key !== "student_id" && key !== "koreanName" && key !== "englishName" && key !== "studentGroup" && key !== "team") {
          if (!summary[key]) summary[key] = { checked: 0, total: 0 };
          if (row[key]) summary[key].checked += 1;
          summary[key].total += 1;
        }
      });
    });
    setAttendanceSummary(summary);
  };

  const handleDayChange = (e) => {
    setDay(e.target.value);
    setSession("");
  };

  const handleSessionChange = (e) => {
    setSession(e.target.value);
  };

  const handleTitleClick = () => {
    navigate("/");
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/download`, {
        params: { search, day, session, group, team },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance.xlsx');
      document.body.appendChild(link);
      link.click();
      showAlert("엑셀 파일이 다운로드되었습니다.");
    } catch (error) {
      console.error("Error downloading Excel file:", error);
      showAlert("엑셀 다운로드 중 오류가 발생했습니다.", "error");
    }
  };

  const getSummaryColumns = () => {
    return Object.keys(attendanceSummary);
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
            AWANA Camp 출석 관리
          </Typography>
          <Chip 
            label={`총 ${attendanceData.length}명`} 
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

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Search color="primary" />
          검색 및 필터
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
          placeholder="한글/영어 이름 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>그룹 선택</InputLabel>
              <Select
          value={group}
                label="그룹 선택"
          onChange={(e) => setGroup(e.target.value)}
        >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="KNOW">KNOW</MenuItem>
                <MenuItem value="LOVE">LOVE</MenuItem>
                <MenuItem value="SERVE">SERVE</MenuItem>
                <MenuItem value="GLORY">GLORY</MenuItem>
                <MenuItem value="HOLY">HOLY</MenuItem>
                <MenuItem value="GRACE">GRACE</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>조 선택</InputLabel>
              <Select
          value={team}
                label="조 선택"
          onChange={(e) => setTeam(e.target.value)}
        >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="1">1조</MenuItem>
                <MenuItem value="2">2조</MenuItem>
                <MenuItem value="3">3조</MenuItem>
                <MenuItem value="4">4조</MenuItem>
                <MenuItem value="5">5조</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<Search />}
                onClick={handleSearch}
                size="small"
              >
                검색
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleSearch}
                size="small"
              >
                새로고침
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadExcel}
                size="small"
              >
                엑셀 다운로드
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      {getSummaryColumns().length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            출석 현황 요약
          </Typography>
          <Grid container spacing={2}>
            {getSummaryColumns().map((key) => (
              <Grid item xs={12} sm={6} md={3} lg={2} key={key}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {key}
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {attendanceSummary[key].checked}/{attendanceSummary[key].total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({Math.round((attendanceSummary[key].checked / attendanceSummary[key].total) * 100)}%)
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Attendance Table */}
      <Paper elevation={2}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                  학생 ID
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                  한글 이름
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                  영어 이름
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                  그룹
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                  조
                </TableCell>
                {getSummaryColumns().map((key) => (
                  <TableCell 
                    key={key} 
                    sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: 'primary.main', 
                      color: 'white',
                      minWidth: 100
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" component="div">
                        {key}
                      </Typography>
                      <Typography variant="caption" component="div">
                        {attendanceSummary[key].checked}/{attendanceSummary[key].total}
                      </Typography>
                    </Box>
                  </TableCell>
            ))}
              </TableRow>
            </TableHead>
            <TableBody>
          {attendanceData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.student_id}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{row.koreanName}</TableCell>
                  <TableCell>{row.englishName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.studentGroup} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${row.team}조`} 
                      size="small" 
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  {getSummaryColumns().map((key) => (
                    <TableCell key={key} sx={{ textAlign: 'center' }}>
                      {row[key] ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="disabled" fontSize="small" />
                      )}
                    </TableCell>
              ))}
                </TableRow>
          ))}
            </TableBody>
          </Table>
        </TableContainer>

        {attendanceData.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              출석 데이터가 없습니다.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AttendanceCheckAdminPage;
