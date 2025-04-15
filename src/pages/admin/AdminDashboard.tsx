import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import {
  Event as EventIcon,
  Church as ChurchIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const stats: StatCard[] = [
  {
    title: '총 이벤트',
    value: 12,
    icon: <EventIcon sx={{ fontSize: 40 }} />,
    color: '#1976d2',
  },
  {
    title: '등록된 교회',
    value: 156,
    icon: <ChurchIcon sx={{ fontSize: 40 }} />,
    color: '#2e7d32',
  },
  {
    title: '이번 달 영수증',
    value: 45,
    icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
    color: '#ed6c02',
  },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          대시보드
        </Typography>
        <Typography color="text.secondary">
          AWANA 관리자 시스템에 오신 것을 환영합니다.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.title}>
            <Card>
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: `${stat.color}15`,
                    p: 1,
                    borderRadius: 2,
                  }}
                >
                  {React.cloneElement(stat.icon as React.ReactElement, {
                    sx: { color: stat.color },
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          빠른 작업
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/events/create')}
            >
              새 이벤트 만들기
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/churches/create')}
            >
              새 교회 등록
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box>
        <Typography variant="h6" gutterBottom>
          최근 활동
        </Typography>
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              최근 활동 내역이 여기에 표시됩니다.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 