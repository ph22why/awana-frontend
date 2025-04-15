import React from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface Receipt {
  id: string;
  churchId: string;
  churchName: string;
  amount: number;
  date: string;
  type: '회비' | '교재비' | '기타';
  status: '발행완료' | '발행중' | '미발행';
}

const receipts: Receipt[] = [
  {
    id: '1',
    churchId: '0001-a',
    churchName: '서울중앙교회',
    amount: 500000,
    date: '2024-03-15',
    type: '회비',
    status: '발행완료',
  },
  {
    id: '2',
    churchId: '0002-a',
    churchName: '부산성도교회',
    amount: 300000,
    date: '2024-03-14',
    type: '교재비',
    status: '발행중',
  },
  {
    id: '3',
    churchId: '0003-a',
    churchName: '대구은혜교회',
    amount: 450000,
    date: '2024-03-13',
    type: '회비',
    status: '발행완료',
  },
];

const ReceiptManagePage: React.FC = () => {
  const navigate = useNavigate();

  const handleView = (id: string) => {
    navigate(`/admin/receipts/${id}`);
  };

  const handleDownload = (id: string) => {
    // TODO: Implement download functionality
    console.log('Download receipt:', id);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        영수증 관리
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="교회명 또는 영수증 번호 검색"
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>영수증 종류</InputLabel>
          <Select label="영수증 종류" defaultValue="all">
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="회비">회비</MenuItem>
            <MenuItem value="교재비">교재비</MenuItem>
            <MenuItem value="기타">기타</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>상태</InputLabel>
          <Select label="상태" defaultValue="all">
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="발행완료">발행완료</MenuItem>
            <MenuItem value="발행중">발행중</MenuItem>
            <MenuItem value="미발행">미발행</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>영수증 번호</TableCell>
              <TableCell>교회</TableCell>
              <TableCell>금액</TableCell>
              <TableCell>날짜</TableCell>
              <TableCell>종류</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="right">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>{receipt.id}</TableCell>
                <TableCell>{`${receipt.churchName} (${receipt.churchId})`}</TableCell>
                <TableCell>
                  {receipt.amount.toLocaleString()}원
                </TableCell>
                <TableCell>
                  {new Date(receipt.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{receipt.type}</TableCell>
                <TableCell>{receipt.status}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleView(receipt.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleDownload(receipt.id)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReceiptManagePage; 