import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { eventApi } from '@/services/api/eventApi';
import { churchApi } from '@/services/api/churchApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Church, Receipt, Plus, BookOpen } from 'lucide-react';

interface StatCardData {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [eventCount, setEventCount] = useState<number>(0);
  const [churchCount, setChurchCount] = useState<number>(0);
  const [newChurchCount, setNewChurchCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const allEvents = await eventApi.getEvents();
        const events = allEvents.filter(event => event.event_Year === year);
        setEventCount(events.length);

        const allChurchRes = await churchApi.searchChurches({ getAllResults: true });
        const allChurches = allChurchRes.data;
        setChurchCount(allChurches.length);

        const startOfMonth = new Date(year, now.getMonth(), 1);
        const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);
        const newChurches = allChurches.filter(c => {
          const created = new Date(c.createdAt || '');
          return created >= startOfMonth && created <= endOfMonth;
        });
        setNewChurchCount(newChurches.length);
      } catch (e) {
        console.error('Failed to fetch stats:', e);
        setEventCount(0);
        setChurchCount(0);
        setNewChurchCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats: StatCardData[] = [
    {
      title: '올해 이벤트',
      value: loading ? '-' : eventCount,
      icon: <Calendar className="h-8 w-8" />,
      color: 'text-blue-600',
    },
    {
      title: '등록된 교회',
      value: loading ? '-' : churchCount,
      icon: <Church className="h-8 w-8" />,
      color: 'text-green-600',
    },
    {
      title: '신규 등록 교회(이번 달)',
      value: loading ? '-' : newChurchCount,
      icon: <Church className="h-8 w-8" />,
      color: 'text-orange-600',
    },
  ];

  if (user?.role === 'mini') {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertDescription>접근 권한이 없습니다.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">대시보드</h1>
        <p className="text-muted-foreground">
          AWANA 관리자 시스템에 오신 것을 환영합니다.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-accent ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/admin/events/manage')}>
            <Plus className="mr-2 h-4 w-4" />
            이벤트 관리
          </Button>
          <Button onClick={() => navigate('/admin/churches/manage')}>
            <Plus className="mr-2 h-4 w-4" />
            교회 관리
          </Button>
          <Button onClick={() => navigate('/admin/receipts/manage')} variant="secondary">
            <Receipt className="mr-2 h-4 w-4" />
            영수증 관리
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">최근 활동</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              최근 활동 내역이 여기에 표시됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
