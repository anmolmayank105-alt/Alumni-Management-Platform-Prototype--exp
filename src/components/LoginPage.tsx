import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { fallbackDatabase as mongoDatabase } from '../lib/fallbackDatabase';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('admin@university.edu');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('');
  const [major, setMajor] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [enrollmentYear, setEnrollmentYear] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      const user = await mongoDatabase.authenticateUser(email, password);
      
      if (!user) {
        setError('Invalid email or password. Please check your credentials.');
        return;
      }

      onLogin(user);
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name || !email || !password || !userType) {
        setError('Please fill in all required fields');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      // Check if user already exists
      const existingUsers = await mongoDatabase.getAllUsers();
      const existingUser = existingUsers.find(u => u.email === email);
      if (existingUser) {
        setError('An account with this email already exists');
        return;
      }

      const newUser = await mongoDatabase.createUser({
        name,
        email,
        password,
        role: userType === 'management' ? 'admin' : userType as any,
        userType: userType as any,
        major: major || undefined,
        branch: branch || undefined,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        enrollmentYear: enrollmentYear ? parseInt(enrollmentYear) : undefined,
        department: department || undefined,
        college: 'State University',
      });

      onLogin(newUser);
    } catch (err) {
      setError('An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (isAdmin = false) => {
    const demoUser = isAdmin 
      ? await mongoDatabase.authenticateUser('admin@university.edu', 'admin123')
      : await mongoDatabase.authenticateUser('john.doe@university.edu', 'password123');
    
    if (demoUser) {
      onLogin(demoUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-gray-900">University Alumni Network</h1>
          <p className="text-gray-600 mt-2">Connect with your fellow graduates</p>
        </div>

        {/* Login/Signup Tabs */}
        <Card className="border-0 shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="space-y-0 pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4 mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full rounded-lg bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
                
                <div className="pt-4 border-t space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-lg"
                    onClick={() => handleDemoLogin(true)}
                    type="button"
                  >
                    Login as Admin (Demo)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-lg"
                    onClick={() => handleDemoLogin(false)}
                    type="button"
                  >
                    Login as Alumni (Demo)
                  </Button>
                  <div className="text-xs text-gray-500 mt-2">
                    Demo credentials: admin@university.edu / admin123 or john.doe@university.edu / password123
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-lg"
                      required
                      minLength={6}
                    />
                    <div className="text-xs text-gray-500">Password must be at least 6 characters</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-userType">User Type</Label>
                    <Select value={userType} onValueChange={setUserType}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alumni">Alumni</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Faculty/Teacher</SelectItem>
                        <SelectItem value="management">Management Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-major">Major</Label>
                    <Input
                      id="signup-major"
                      placeholder="Computer Science"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-branch">Branch</Label>
                    <Input
                      id="signup-branch"
                      placeholder="Main Campus"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-graduationYear">Graduation Year</Label>
                    <Input
                      id="signup-graduationYear"
                      type="number"
                      placeholder="2023"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-enrollmentYear">Enrollment Year</Label>
                    <Input
                      id="signup-enrollmentYear"
                      type="number"
                      placeholder="2019"
                      value={enrollmentYear}
                      onChange={(e) => setEnrollmentYear(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-department">Department</Label>
                    <Input
                      id="signup-department"
                      placeholder="Computer Science Department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full rounded-lg bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <div className="text-center">
          <p className="text-gray-500">
            Join our community of <span className="text-blue-600">10,000+</span> alumni
          </p>
        </div>
      </div>
    </div>
  );
}