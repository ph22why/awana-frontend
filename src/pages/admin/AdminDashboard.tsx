import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Alert,
} from '@mui/material';
import {
  Event as EventIcon,
  Church as ChurchIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { eventApi } from '../../services/api/eventApi';
import { churchApi } from '../../services/api/churchApi';

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useOutletContext<{ role: string }>();

  const [eventCount, setEventCount] = useState<number>(0);
  const [churchCount, setChurchCount] = useState<number>(0);
  const [newChurchCount, setNewChurchCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // 올해 생성된 이벤트 개수
        const now = new Date();
        const year = now.getFullYear();
        const events = await eventApi.getEvents({ year });
        setEventCount(events.length);
        // 전체 교회 목록 받아서 개수 계산
        const allChurchRes = await churchApi.searchChurches({ getAllResults: true });
        const allChurches = allChurchRes.data;
        setChurchCount(allChurches.length);
        // 이번 달 신규 등록 교회 개수
        const startOfMonth = new Date(year, now.getMonth(), 1);
        const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);
        const newChurches = allChurches.filter(c => {
          const created = new Date(c.createdAt);
          return created >= startOfMonth && created <= endOfMonth;
        });
        setNewChurchCount(newChurches.length);
      } catch (e) {
        setEventCount(0);
        setChurchCount(0);
        setNewChurchCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      title: '올해 이벤트',
      value: loading ? '-' : eventCount,
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: '등록된 교회',
      value: loading ? '-' : churchCount,
      icon: <ChurchIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: '신규 등록 교회(이번 달)',
      value: loading ? '-' : newChurchCount,
      icon: <ChurchIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
  ];

  return (
    <Container maxWidth="lg">
      {role === 'mini' ? (
        <Alert severity="error" sx={{ mb: 2 }}>접근 권한이 없습니다.</Alert>
      ) : (
        <>
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
        </>
      )}
    </Container>
  );
};

export default AdminDashboard; 