"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, LogIn, KeyRound } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@whereismybus.in');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const result = await adminLogin(email.trim(), password.trim());
      localStorage.setItem('token', result.token);
      localStorage.setItem('adminUser', JSON.stringify(result.user));
      toast({ title: 'Login successful', description: `Welcome, ${result.user.name}` });
      router.push('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@whereismybus.in');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 px-4">
      <Card className="w-full max-w-md shadow-2xl border border-slate-800 bg-slate-900 text-slate-100 overflow-hidden">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 text-center border-b border-slate-800">
          <div className="mx-auto h-14 w-14 bg-blue-600/30 border border-blue-400/40 rounded-full flex items-center justify-center mb-3">
            <Lock className="h-7 w-7 text-blue-300" />
          </div>
          <CardTitle className="text-2xl font-black">🚌 Admin Panel</CardTitle>
          <CardDescription className="text-slate-300">
            Login to manage Where Is My Bus
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@whereismybus.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950 text-white border-slate-700"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950 text-white border-slate-700"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </Button>
          </form>

          {/* Helper pre-fill bar */}
          <div className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleFillDemo} 
              className="w-full bg-slate-950/80 border-slate-800 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              Pre-fill Default Credentials
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-slate-500 pb-6 border-t border-slate-800/60 pt-4">
          Return to <a href="/" className="text-blue-400 ml-1 hover:underline font-medium">Homepage</a>
        </CardFooter>
      </Card>
    </div>
  );
}
