import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-foreground">환영합니다</h1>
        <p className="text-xl text-muted-foreground">프로젝트가 준비되었습니다</p>
        <div className="flex gap-4 justify-center mt-8">
          <Link to="/login">
            <Button size="lg">로그인</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline">회원가입</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
