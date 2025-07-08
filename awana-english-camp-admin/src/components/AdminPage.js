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
  const [limit, setLimit] = useState(10);
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

  const handleAssignGroups = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/admin/assign-groups`);
      showAlert(response.data.message);
      fetchData();
    } catch (error) {
      showAlert("그룹 배정 중 오류가 발생했습니다.", "error");
    }
  };

  const handleRankAssignment = async () => {
    try {
      const response = await axios.put(`${BACKEND_URL}/score/all-rank`);
      showAlert(response.data.message);
      fetchData();
    } catch (error) {
      showAlert("등급 부여 중 오류가 발생했습니다.", "error");
    }
  };

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
      default:
        return [];
    }
  };
    
  const formatCellValue = (item, column) => {
    if (column.key === 'gender') {
      return item[column.key] === 'male' ? '남자' : item[column.key] === 'female' ? '여자' : item[column.key];
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
      scores: "성적"
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
                <MenuItem value={10}>10개</MenuItem>
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
                    onClick={handleAssignGroups}
                    size="small"
                    disabled={loading}
                  >
                    그룹 배정
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EmojiEvents />}
                    onClick={handleRankAssignment}
                    size="small"
                    disabled={loading}
                  >
                    등급 부여
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
