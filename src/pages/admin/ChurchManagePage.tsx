import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Church {
  mainId: string;
  subId: string;
  name: string;
  location: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface ChurchFormData {
  mainId: string;
  subId: string;
  name: string;
  location: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003';

const ChurchManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [churches, setChurches] = useState<Church[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChurch, setEditingChurch] = useState<Church | null>(null);
  const [formData, setFormData] = useState<ChurchFormData>({
    mainId: '',
    subId: '',
    name: '',
    location: ''
  });

  const fetchChurches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/churches?page=${page}&search=${searchTerm}`);
      setChurches(response.data.data.churches);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching churches:', error);
    }
  };

  useEffect(() => {
    fetchChurches();
  }, [page, searchTerm]);

  const handleOpenDialog = (church?: Church) => {
    if (church) {
      setEditingChurch(church);
      setFormData({
        mainId: church.mainId,
        subId: church.subId,
        name: church.name,
        location: church.location
      });
    } else {
      setEditingChurch(null);
      setFormData({
        mainId: '',
        subId: '',
        name: '',
        location: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingChurch(null);
    setFormData({
      mainId: '',
      subId: '',
      name: '',
      location: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingChurch) {
        await axios.put(`${API_BASE_URL}/api/churches/${editingChurch.mainId}/${editingChurch.subId}`, {
          name: formData.name,
          location: formData.location
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/churches`, formData);
      }
      handleCloseDialog();
      fetchChurches();
    } catch (error) {
      console.error('Error saving church:', error);
    }
  };

  const handleDelete = async (church: Church) => {
    if (window.confirm('정말로 이 교회를 삭제하시겠습니까?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/churches/${church.mainId}/${church.subId}`);
        fetchChurches();
      } catch (error) {
        console.error('Error deleting church:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        교회 관리
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="교회 검색"
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          새 교회 등록
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>교회 ID</TableCell>
              <TableCell>교회명</TableCell>
              <TableCell>위치</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {churches.map((church) => (
              <TableRow key={`${church.mainId}-${church.subId}`}>
                <TableCell>{`${church.mainId}-${church.subId}`}</TableCell>
                <TableCell>{church.name}</TableCell>
                <TableCell>{church.location}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(church)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(church)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingChurch ? '교회 수정' : '교회 추가'}</DialogTitle>
        <DialogContent>
          {!editingChurch && (
            <>
              <TextField
                fullWidth
                label="교회 ID (4자리)"
                value={formData.mainId}
                onChange={(e) => setFormData({ ...formData, mainId: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="교회 서브 ID (1자리 알파벳)"
                value={formData.subId}
                onChange={(e) => setFormData({ ...formData, subId: e.target.value })}
                margin="normal"
              />
            </>
          )}
          <TextField
            fullWidth
            label="교회명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="위치"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChurchManagePage; 