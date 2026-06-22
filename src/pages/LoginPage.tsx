import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithUsername, signUpWithUsername } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: err } = await signInWithUsername(username, password);
        if (err) throw err;
        navigate(from, { replace: true });
      } else {
        if (password.length < 6) {
          setError('密码至少6个字符');
          setLoading(false);
          return;
        }
        const { error: err } = await signUpWithUsername(username, password);
        if (err) throw err;
        setError('注册成功！请使用你的账号和密码登录。');
        setMode('login');
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('User already registered')) {
        setError('该用户名已存在，请换个用户名或直接登录');
      } else if (msg.includes('Invalid login credentials')) {
        setError('用户名或密码错误');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-serif">4+1 教案迭代助手</CardTitle>
          <CardDescription>
            {mode === 'login' ? '登录后继续使用' : '创建一个新账号'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className={`text-sm p-3 rounded-md ${
                error.includes('成功') 
                  ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' 
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                placeholder="输入用户名"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="bg-card border-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-card border-primary/20"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'login' ? '登录' : '注册'}
            </Button>

            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>
                  还没有账号？{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    注册
                  </button>
                </>
              ) : (
                <>
                  已有账号？{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    登录
                  </button>
                </>
              )}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
