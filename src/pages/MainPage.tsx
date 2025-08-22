import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import { CalendarMonth, School, Receipt, MenuBook } from "@mui/icons-material";
import { eventApi, IEvent } from "../services/api/eventApi";
import { useEffect, useState } from "react";

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // 모든 이벤트를 받아오더라도, 프론트에서 한 번 더 공개만 필터링
        const allEvents: IEvent[] = await eventApi.getPublicEvents();
        const publicEvents = allEvents.filter(e => e.event_Open_Available === "공개");
        setEvents(publicEvents);
      } catch (err: any) {
        setError(err.message || "이벤트 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // 날짜/일시 포맷 유틸리티
  const formatKoreanDate = (date: Date) =>
    date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatKoreanDateTime = (date: Date) =>
    date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const buildDateOrDateTime = (
    dateString?: string | null,
    timeString?: string | null
  ): Date | null => {
    if (!dateString) return null;
    const datePart = dateString.split("T")[0];
    if (timeString) {
      return new Date(`${datePart}T${timeString}:00`);
    }
    return new Date(datePart);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 8,
          pb: 6,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 100%)",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 4,
            }}
          >
            AWANA Events
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
            sx={{
              mb: 6,
              fontWeight: 300,
            }}
          >
            Approved Workmen Are Not Ashamed
          </Typography>
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/* <Button 
              variant="outlined" 
              onClick={() => navigate('/events')}
              startIcon={<CalendarMonth />}
              sx={{
                color: '#F59E0B',
                borderColor: '#F59E0B',
                borderWidth: 2,
                px: 3,
                '&:hover': {
                  borderColor: '#D97706',
                  borderWidth: 2,
                  bgcolor: 'transparent',
                }
              }}
            >
              이벤트 보기
            </Button> */}
            <Button
              variant="outlined"
              onClick={() => navigate("/churches")}
              startIcon={<School />}
              sx={{
                color: "#F59E0B",
                borderColor: "#F59E0B",
                borderWidth: 2,
                px: 3,
                "&:hover": {
                  borderColor: "#D97706",
                  borderWidth: 2,
                  bgcolor: "transparent",
                },
              }}
            >
              교회 찾기
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/receipts")}
              startIcon={<Receipt />}
              sx={{
                color: "#F59E0B",
                borderColor: "#F59E0B",
                borderWidth: 2,
                px: 3,
                "&:hover": {
                  borderColor: "#D97706",
                  borderWidth: 2,
                  bgcolor: "transparent",
                },
              }}
            >
              영수증 발급
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.open("/bt", "_blank")}
              startIcon={<MenuBook />}
              sx={{
                color: "#F59E0B",
                borderColor: "#F59E0B",
                borderWidth: 2,
                px: 3,
                "&:hover": {
                  borderColor: "#D97706",
                  borderWidth: 2,
                  bgcolor: "transparent",
                },
              }}
            >
              BT 교육
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Featured Events Section */}
      <Box sx={{ bgcolor: "background.default", py: 2 }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 700,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -16,
                left: "50%",
                transform: "translateX(-50%)",
                width: 60,
                height: 4,
                bgcolor: "primary.main",
                borderRadius: 2,
              },
            }}
          >
            접수 중 이벤트
          </Typography>
          {loading ? (
            <Typography align="center">불러오는 중...</Typography>
          ) : error ? (
            <Typography color="error" align="center">
              {error}
            </Typography>
          ) : events.length === 0 ? (
            <Typography
              align="center"
              sx={{ color: "text.secondary", py: 8, fontSize: 20 }}
            >
              접수 중인 이벤트가 없습니다.
            </Typography>
          ) : (
            <Box
              sx={{
                maxHeight: "600px",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "background.paper",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "primary.light",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "primary.main",
                  },
                },
              }}
            >
              <Grid container spacing={4}>
                {events.map((event) => (
                  <Grid
                    item
                    key={event._id}
                    xs={12}
                    sm={6}
                    md={4}
                    style={{ marginTop: "10px" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.3s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-8px)",
                        },
                      }}
                    >
                      {/* <CardMedia
                        component="img"
                        sx={{
                          height: 200,
                          objectFit: 'cover',
                        }}
                        image={event.imageUrl}
                        alt={event.title}
                      /> */}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h2"
                          sx={{ fontWeight: 600 }}
                        >
                          {event.event_Name}
                          {(() => {
                            // 마감 상태면 [마감] 표시
                            const now = Date.now();
                            let regEnd = null;
                            let eventEnd = null;
                            if (
                              event.event_Registration_End_Time &&
                              event.event_Start_Date
                            ) {
                              regEnd = Date.parse(
                                `${event.event_Start_Date.split("T")[0]}T${
                                  event.event_Registration_End_Time
                                }:59`
                              );
                            }
                            if (event.event_End_Date) {
                              eventEnd = Date.parse(event.event_End_Date);
                              const eventEndWithTime = new Date(eventEnd);
                              eventEndWithTime.setHours(23, 59, 59, 999);
                              if (
                                regEnd &&
                                now > regEnd &&
                                now <= eventEndWithTime.getTime()
                              ) {
                                return (
                                  <span
                                    style={{
                                      color: "#F87171",
                                      marginLeft: 8,
                                      fontSize: 18,
                                    }}
                                  >
                                    [마감]
                                  </span>
                                );
                              }
                            }
                            return null;
                          })()}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <span>{event.event_Place}</span>
                          <span>·</span>
                          <span>
                            {(() => {
                              if (!event.event_Start_Date || event.event_Start_Date === "미정") {
                                return `행사일정: 미정`;
                              }
                              if (event.event_End_Date) {
                                return `행사일정: ${formatKoreanDate(
                                  new Date(event.event_Start_Date)
                                )} ~ ${formatKoreanDate(new Date(event.event_End_Date))}`;
                              }
                              return `행사일정: ${formatKoreanDate(new Date(event.event_Start_Date))}`;
                            })()}
                          </span>
                        </Typography>

                        {/* 접수기간 */}
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            fontWeight: 500,
                            mt: 0.5,
                          }}
                        >
                          <CalendarMonth fontSize="small" />
                          {(() => {
                            const regStart = buildDateOrDateTime(
                              event.event_Registration_Start_Date,
                              event.event_Registration_Start_Time
                            );
                            const regEnd = buildDateOrDateTime(
                              event.event_Registration_End_Date,
                              event.event_Registration_End_Time
                            );

                            if (!regStart && !regEnd) return `접수기간: 미정`;
                            const startText = regStart
                              ? formatKoreanDateTime(regStart)
                              : "-";
                            const endText = regEnd
                              ? formatKoreanDateTime(regEnd)
                              : "-";
                            return `접수기간: ${startText} ~ ${endText}`;
                          })()}
                        </Typography>
                      </CardContent>
                      <Divider sx={{ mx: 2 }} />
                      <CardActions sx={{ p: 2 }}>
                        {(() => {
                          const now = Date.now();
                          let regStart = null;
                          let regEnd = null;
                          if (event.event_Registration_Start_Time && event.event_Registration_Start_Date) {
                            regStart = Date.parse(`${event.event_Registration_Start_Date.split("T")[0]}T${event.event_Registration_Start_Time}:00`);
                          }
                          if (event.event_Registration_End_Time && event.event_Registration_End_Date) {
                            regEnd = Date.parse(`${event.event_Registration_End_Date.split("T")[0]}T${event.event_Registration_End_Time}:59`);
                          }
                          // 접수기간 중
                          if (regStart && regEnd && now >= regStart && now <= regEnd) {
                            return (
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={() => {
                                  if (event.event_Link) {
                                    window.open(event.event_Link, "_blank");
                                  } else {
                                    alert("접수폼이 준비되지 않았습니다.");
                                  }
                                }}
                                sx={{
                                  bgcolor: "primary.main",
                                  color: "white",
                                  "&:hover": {
                                    bgcolor: "primary.dark",
                                  },
                                }}
                              >
                                접수신청
                              </Button>
                            );
                          }
                          // 접수 시작 전
                          if (regStart && now < regStart) {
                            return (
                              <Button
                                fullWidth
                                variant="contained"
                                disabled
                                sx={{ bgcolor: "grey.400", color: "white" }}
                              >
                                접수대기
                              </Button>
                            );
                          }
                          // 접수 마감~이벤트 종료까지
                          if (regEnd && event.event_End_Date) {
                            const eventEnd = Date.parse(event.event_End_Date);
                            const eventEndWithTime = new Date(eventEnd);
                            eventEndWithTime.setHours(23, 59, 59, 999);
                            if (now > regEnd && now <= eventEndWithTime.getTime()) {
                              return (
                                <Button fullWidth variant="contained" disabled sx={{ bgcolor: "grey.400", color: "white" }}>
                                  접수마감
                                </Button>
                              );
                            }
                          }
                          // 이벤트 종료 후 or 그 외
                          return null;
                        })()}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </Box>

      {/* Receipt Section */}
      <Container sx={{ py: 4 }} maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "primary.light",
            color: "primary.contrastText",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
              zIndex: 1,
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              textAlign: "center",
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom align="center">
              영수증 발급 서비스
            </Typography>
            <Typography
              variant="body1"
              align="center"
              paragraph
              sx={{ mb: 3, maxWidth: "600px", mx: "auto" }}
            >
              AWANA 이벤트의 영수증을 온라인으로 간편하게 발급받으세요.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/receipts")}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: "1.1rem",
                color: "#FFFFFF",
                borderColor: "#FFFFFF",
                borderWidth: 2,
                borderRadius: 3,
                textTransform: "none",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease-in-out",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.1)",
                  transform: "translateX(-100%)",
                  transition: "transform 0.3s ease-in-out",
                },
                "&:hover": {
                  borderColor: "#FFFFFF",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  "&::before": {
                    transform: "translateX(0)",
                  },
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              영수증 발급하기
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default MainPage;
