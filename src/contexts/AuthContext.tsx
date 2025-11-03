import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/apiError';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // 토큰 만료 체크 및 자동 로그아웃
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = async () => {
      try {
        await api.get('/auth/verify', token);
      } catch (error: any) {
        if (error.statusCode === 401) {
          logout();
          toast({
            variant: "destructive",
            title: "세션 만료",
            description: "다시 로그인해주세요.",
          });
        }
      }
    };

    // 5분마다 토큰 검증
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast({
        title: "로그인 성공",
        description: `환영합니다, ${response.user.username}님!`,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: errorMessage,
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast({
      title: "로그아웃",
      description: "로그아웃되었습니다.",
    });
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh', {}, token || undefined);
      setToken(response.token);
      localStorage.setItem('token', response.token);
    } catch (error) {
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
