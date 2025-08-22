import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Avatar,
} from '@mui/material';
import { School, Person, ArrowBack } from '@mui/icons-material';

const SelectRolePage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              onClick={() => navigate('/')}
              sx={{ color: 'white', minWidth: 'auto' }}
            >
              <ArrowBack />
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              역할 선택
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            해당하는 역할을 선택해주세요
          </Typography>
        </Container>
      </Box>

      {/* Role Selection */}
      <Container sx={{ py: 6 }} maxWidth="md">
        <Grid container spacing={4} justifyContent="center">
          {/* 교회담당자 */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                },
              }}
              onClick={() => navigate('/church-manager')}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <School sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  교회담당자
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  교회를 대표하여 BT 프로그램에 참여하는 담당자
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic' }}
                >
                  • 교회 정보 등록 및 관리
                  <br />
                  • 교회 소속 참가자 관리
                  <br />
                  • 단체 신청 및 접수
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ px: 4, borderRadius: 2 }}
                >
                  선택하기
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* 개인교사 */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                },
              }}
              onClick={() => navigate('/individual-teacher')}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <Person sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  개인교사
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  개인 자격으로 BT 프로그램에 참여하는 교사
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic' }}
                >
                  • 개인 정보 등록 및 관리
                  <br />
                  • 개별 신청 및 접수
                  <br />
                  • 개인 자격증명 관리
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  sx={{ px: 4, borderRadius: 2 }}
                >
                  선택하기
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SelectRolePage;
