import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, School, Receipt, BookOpen } from 'lucide-react';
import { eventApi } from '@/services/api/eventApi';
import type { IEvent } from '@/types/event';
import { useEffect, useState } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary/5 to-transparent py-16">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">AWANA Events</h1>
          <p className="text-2xl text-muted-foreground mb-8 font-light">
            Approved Workmen Are Not Ashamed
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/churches')}
              className="border-2"
            >
              <School className="mr-2 h-4 w-4" />
              교회 찾기
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/receipts')}
              className="border-2"
            >
              <Receipt className="mr-2 h-4 w-4" />
              영수증 발급
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/bt', '_blank')}
              className="border-2"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              BT 교육
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 relative inline-block">
              접수 중 이벤트
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 w-16 h-1 bg-primary rounded-full" />
            </h2>
          </div>

          {loading ? (
            <p className="text-center">불러오는 중...</p>
          ) : error ? (
            <p className="text-center text-destructive">{error}</p>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 text-xl">
              접수 중인 이벤트가 없습니다.
            </p>
          ) : (
            <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                {events.map((event) => {
                  const now = Date.now();
                  let regStart: number | null = null;
                  let regEnd: number | null = null;

                  if (event.event_Registration_Start_Time && event.event_Registration_Start_Date) {
                    regStart = Date.parse(`${event.event_Registration_Start_Date.split("T")[0]}T${event.event_Registration_Start_Time}:00`);
                  }
                  if (event.event_Registration_End_Time && event.event_Registration_End_Date) {
                    regEnd = Date.parse(`${event.event_Registration_End_Date.split("T")[0]}T${event.event_Registration_End_Time}:59`);
                  }

                  const showDeadlineBadge = (() => {
                    if (regEnd && event.event_End_Date) {
                      const eventEnd = Date.parse(event.event_End_Date);
                      const eventEndWithTime = new Date(eventEnd);
                      eventEndWithTime.setHours(23, 59, 59, 999);
                      if (now > regEnd && now <= eventEndWithTime.getTime()) {
                        return true;
                      }
                    }
                    return false;
                  })();

                  return (
                    <Card key={event._id} className="flex flex-col hover:-translate-y-2 transition-transform">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {event.event_Name}
                          {showDeadlineBadge && (
                            <span className="text-destructive text-lg">[마감]</span>
                          )}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span>{event.event_Place}</span>
                          <span>·</span>
                          <span>
                            {(() => {
                              if (!event.event_Start_Date || event.event_Start_Date === "미정") {
                                return `행사일정: 미정`;
                              }
                              if (event.event_End_Date) {
                                return `행사일정: ${formatKoreanDate(new Date(event.event_Start_Date))} ~ ${formatKoreanDate(new Date(event.event_End_Date))}`;
                              }
                              return `행사일정: ${formatKoreanDate(new Date(event.event_Start_Date))}`;
                            })()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                          <CalendarDays className="h-4 w-4" />
                          {(() => {
                            const regStartDate = buildDateOrDateTime(
                              event.event_Registration_Start_Date,
                              event.event_Registration_Start_Time
                            );
                            const regEndDate = buildDateOrDateTime(
                              event.event_Registration_End_Date,
                              event.event_Registration_End_Time
                            );

                            if (!regStartDate && !regEndDate) return `접수기간: 미정`;
                            const startText = regStartDate ? formatKoreanDateTime(regStartDate) : "-";
                            const endText = regEndDate ? formatKoreanDateTime(regEndDate) : "-";
                            return `접수기간: ${startText} ~ ${endText}`;
                          })()}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        {(() => {
                          // 접수기간 중
                          if (regStart && regEnd && now >= regStart && now <= regEnd) {
                            return (
                              <Button
                                className="w-full"
                                onClick={() => {
                                  if (event.event_Link) {
                                    window.open(event.event_Link, "_blank");
                                  } else {
                                    alert("접수폼이 준비되지 않았습니다.");
                                  }
                                }}
                              >
                                접수신청
                              </Button>
                            );
                          }
                          // 접수 시작 전
                          if (regStart && now < regStart) {
                            return (
                              <Button className="w-full" disabled>
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
                                <Button className="w-full" disabled>
                                  접수마감
                                </Button>
                              );
                            }
                          }
                          return null;
                        })()}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
