
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // For now, use this simple authentication for the admin user
      if (username === 'AlhassanAli' && password === '1234') {
        // Store authentication info in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: 'admin-user',
          username: 'AlhassanAli',
          role: 'ADMIN'
        }));
        
        // Reset all dummy data when logging in
        localStorage.removeItem('initialBalance');
        
        toast({
          title: "Login successful",
          description: "Welcome back, AlhassanAli!",
        });
        
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid username or password. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An error occurred during login. Please try again.",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80')" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="w-full max-w-md px-4 z-10">
        <Card className="bg-white/90 backdrop-blur-md dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-forex-primary dark:text-white">Forex Trading Journal</CardTitle>
            <CardDescription className="dark:text-gray-400">Enter your credentials to access your trading journal</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="Enter your username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/80 dark:bg-gray-800/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/80 dark:bg-gray-800/80"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-forex-primary hover:bg-forex-primary/90" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
