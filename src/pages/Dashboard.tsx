import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">대시보드</h1>
            <p className="text-muted-foreground mt-2">환영합니다, {user?.username}님</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            로그아웃
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>프로필</CardTitle>
              <CardDescription>회원 정보</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">아이디:</span>
                <span className="font-medium">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">이메일:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">역할:</span>
                <span className="font-medium">{user?.role}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>통계</CardTitle>
              <CardDescription>활동 요약</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">통계 데이터가 여기에 표시됩니다.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>최근 기록</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">최근 활동이 여기에 표시됩니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
