import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { loginSchema, type LoginRequest } from '@shared/schema';
import { Lock, User, Building, AlertCircle, CheckCircle, Calculator, Shield, Award, Users, TrendingUp, FileText, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { ProfessionalBadge } from '@/components/ui/professional-badge';

export default function Login() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessModalOpen, setLoginSuccessModalOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [showTrialSuccess, setShowTrialSuccess] = useState(false);
  const [trialUserEmail, setTrialUserEmail] = useState('');

  // Check for trial signup success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isTrialSuccess = urlParams.get('trial') === 'success';
    const emailParam = urlParams.get('email');
    
    if (isTrialSuccess) {
      setShowTrialSuccess(true);
      if (emailParam) {
        setTrialUserEmail(decodeURIComponent(emailParam));
        form.setValue('username', decodeURIComponent(emailParam));
      }
      
      // Clear the URL parameters
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiRequest('/api/auth/login', 'POST', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Store authentication data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('sessionToken', data.sessionToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Clear any previous error
      setLoginError(null);
      
      // Invalidate auth queries to trigger re-authentication
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Show professional login success modal
      setLoggedInUser(data.user);
      setLoginSuccessModalOpen(true);
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      
      // Extract error message
      const errorMessage = error.message || 'Login failed. Please try again.';
      setLoginError(errorMessage);
      
      // Show toast with specific error message
      if (errorMessage.includes('Too many login attempts')) {
        toast({
          title: "Account Locked",
          description: "Too many failed login attempts. Please try again later.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('temporarily locked')) {
        toast({
          title: "Account Locked",
          description: "Your account has been temporarily locked due to failed login attempts.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('deactivated')) {
        toast({
          title: "Account Deactivated",
          description: "Your account has been deactivated. Please contact support.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: LoginRequest) => {
    setLoginError(null);
    loginMutation.mutate(data);
  };

  const handleLoginSuccessConfirm = () => {
    setLoginSuccessModalOpen(false);
    // Use setTimeout to ensure authentication state is fully processed
    setTimeout(() => {
      // Redirect to dashboard using react router to avoid full page reload
      setLocation('/dashboard');
      // Also trigger a window reload after navigation to ensure fresh state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex">
      {/* Left Side - Professional Features & Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          {/* Logo & Main Heading */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-4xl font-bold text-white">Taxnify</h1>
                <p className="text-blue-200 text-lg">Unified Business, Accounting, Compliance Platform</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              South Africa's Premier
              <span className="block text-blue-300">Business Management Platform</span>
            </h2>
            <p className="text-blue-100/90 text-lg leading-relaxed">
              Trusted by over 500+ South African businesses for complete accounting, compliance, and business management solutions.
            </p>
          </div>

          {/* Professional Features Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <ProfessionalBadge
              icon="shield"
              title="SARS Compliant & Secure"
              description="Full South African Revenue Service integration with enterprise-grade security"
            />
            <ProfessionalBadge
              icon="award"
              title="Industry Leading Features"
              description="Advanced VAT management, multi-company support, and professional reporting"
            />
            <ProfessionalBadge
              icon="building"
              title="Enterprise Ready"
              description="Scalable architecture supporting businesses from startups to enterprises"
            />
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center space-x-8 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-blue-200 text-sm">Active Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-blue-200 text-sm">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-blue-200 text-sm">Expert Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-white">Taxnify</h1>
            </div>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="space-y-4 pb-8">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</CardTitle>
                <CardDescription className="text-gray-600">
                  Access your business management platform
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {showTrialSuccess && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Trial account created successfully!</strong><br />
                        Your 14-day free trial has started. Please log in to access your new Taxnify account.
                        {trialUserEmail && <><br />Email: <strong>{trialUserEmail}</strong></>}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {loginError && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Username or Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter your username or email"
                            autoComplete="username"
                            disabled={loginMutation.isPending}
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            disabled={loginMutation.isPending}
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Sign In to Dashboard
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Security & Support Links */}
              <div className="pt-6 border-t border-gray-100">
                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="link"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setLocation("/reset-password")}
                  >
                    Forgot your password?
                  </Button>
                  <div>
                    <Button
                      type="button"
                      variant="link"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => setLocation("/trial-signup")}
                    >
                      New to Taxnify? Start your free 30-day trial →
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center items-center space-x-6 mt-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    Bank-Grade Security
                  </span>
                  <span className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    SARS Compliant
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Support */}
          <div className="text-center mt-6 text-sm text-blue-200/80">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@taxnify.co.za" className="text-blue-300 hover:text-white underline">
              support@taxnify.co.za
            </a>
          </div>
        </div>
      </div>

      {/* Login Success Confirmation Modal */}
      {loggedInUser && (
        <ConfirmationModal
          isOpen={loginSuccessModalOpen}
          onClose={handleLoginSuccessConfirm}
          onConfirm={handleLoginSuccessConfirm}
          title="Login Successful"
          description={`Welcome back, ${loggedInUser.name}! You have successfully signed in to your Taxnify account.`}
          confirmText="Continue to Dashboard"
          variant="success"
          icon="success"
          isLoading={false}
        />
      )}
    </div>
  );
}