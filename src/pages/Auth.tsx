
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check credentials
    if (username === 'AlhassanAli' && password === '1234') {
      // Store login state in localStorage to prevent re-login
      localStorage.setItem('forex_tracker_auth', 'true');
      
      toast({
        title: 'Login successful',
        description: 'Welcome to your trading dashboard.',
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } else {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Invalid username or password.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-cover bg-center" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop')` 
      }}
    >
      <div className="mx-auto w-full max-w-md p-4">
        <Card className="bg-white shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-forex-primary">ForexTracker</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-forex-primary hover:bg-forex-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-600">
            <p className="w-full">For demo, use: AlhassanAli / 1234</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
