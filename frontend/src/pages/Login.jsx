import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    login({ email: email.trim(), password })
      .then((res) => {
        if (!res?.success) {
          setError(res?.message || 'Login failed. Please try again.');
          return;
        }
        navigate('/');
      })
      .catch(() => setError('Login failed. Please try again.'))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_35%)]" aria-hidden="true" />

      <Card className="relative w-full max-w-md border-slate-100 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-slate-900">Welcome back</CardTitle>
          <CardDescription className="text-slate-600">
            Log in to review flashcards, take MCQ tests, and continue your topics.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-4">
          {error && (
            <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing you in...' : 'Login'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 text-sm text-slate-600">
          <div className="py-4">
            New here?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              Create an account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Link to="#" className="py-4 px-1 hover:text-slate-800">Forgot password?</Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;