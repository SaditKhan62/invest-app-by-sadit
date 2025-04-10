import { useState, useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Registration schema extending from our insertUserSchema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Login schema is simpler
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(1, "Password is required"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [location] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  
  // Check if the user came from the Discover button
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('from') === 'discover') {
      setShowWelcomeMessage(true);
      // Default to register if coming from discover button
      setActiveTab("register");
    }
  }, []);

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  // Handle register form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left column with form */}
      <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
        {showWelcomeMessage && (
          <div className="mb-6 glass border border-primary/30 rounded-lg p-4 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-primary mb-2">Ready to unlock premium features?</h3>
            <p className="text-sm text-white/80">
              You're just one step away from accessing personalized watchlists, portfolio tracking, 
              and advanced market data. Create your account now to continue your trading journey.
            </p>
          </div>
        )}
        
        <Card className="w-full max-w-md mx-auto glass border border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Welcome to NextGen Trading
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" ? 
                "Log in to your account to access your dashboard" : 
                "Create a new account to start trading"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              className="glass bg-white/5" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              className="glass bg-white/5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full futuristic-gradient" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Log in"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John"
                                className="glass bg-white/5"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Doe"
                                className="glass bg-white/5"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Choose a username"
                              className="glass bg-white/5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              className="glass bg-white/5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password"
                              className="glass bg-white/5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full futuristic-gradient"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-400">
            {activeTab === "login" ? (
              <p>Don't have an account? <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab("register")}>Register</Button></p>
            ) : (
              <p>Already have an account? <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab("login")}>Log in</Button></p>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Right column with hero section */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-900/80 to-purple-900/80 p-6 md:p-10 flex flex-col justify-center items-center text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-primary glow-text">
            Next Generation Trading Platform
          </h1>
          <p className="text-lg mb-8 text-gray-200">
            Access real-time market data, manage your portfolio, and make informed trading decisions with our cutting-edge platform.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass p-4 rounded-lg border border-white/10 backdrop-blur-md">
              <h3 className="text-xl font-semibold mb-2 text-primary">Real-time Data</h3>
              <p className="text-gray-300">Get up-to-the-second market information</p>
            </div>
            <div className="glass p-4 rounded-lg border border-white/10 backdrop-blur-md">
              <h3 className="text-xl font-semibold mb-2 text-primary">Smart Analytics</h3>
              <p className="text-gray-300">Make informed decisions with powerful insights</p>
            </div>
            <div className="glass p-4 rounded-lg border border-white/10 backdrop-blur-md">
              <h3 className="text-xl font-semibold mb-2 text-primary">Portfolio Management</h3>
              <p className="text-gray-300">Track and manage all your investments</p>
            </div>
            <div className="glass p-4 rounded-lg border border-white/10 backdrop-blur-md">
              <h3 className="text-xl font-semibold mb-2 text-primary">Custom Alerts</h3>
              <p className="text-gray-300">Never miss important market movements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}