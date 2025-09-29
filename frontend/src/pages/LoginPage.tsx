import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Silk from "@/components/Silk"
import { BrainCircuit, Chrome, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { AuthService } from "@/services/authService";
import { GoogleLogin } from '@react-oauth/google';
import { useTheme } from "../components/theme-provider"; // <-- Add this

export default function LoginPage() {
  const { theme } = useTheme(); // <-- Add this
  const authService = new AuthService();
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const [toggleLoginPassword, setToggleLoginPassword] = useState(false);
  const [togglePassword, setTogglePassword] = useState(false);
  const [toggleConfirmPassword, setToggleConfirmPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "Guest");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // New state variables for password validation
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const [rightLoaded, setRightLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setRightLoaded(true), 300)
  }, [])

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) setUsername(savedUsername);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "username") {
        setUsername(e.newValue || "Guest");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setError("All fields are required");
      return;
    }

    try {
      // console.log("Attempting login with:", { email: loginEmail });
      
      const result = await authService.login({ 
        email: loginEmail, 
        password: loginPassword 
      });
      
      // console.log("Login result:", result);
      
      if (result?.message === "Login successful") {
        // Store user data from response
        if (result.username) localStorage.setItem("username", result.username);
        if (result.userId) localStorage.setItem("userId", result.userId);
        if (result.email) localStorage.setItem("userEmail", result.email);
        if (result.token) localStorage.setItem("token", result.token); // Store JWT token
        
        setError("");
        // console.log("Login successful, navigating to dashboard");
        navigate("/home"); // Navigate to dashboard to test
      } else {
        console.warn("Unexpected login result:", result);
        setError("Login failed");
      }
    } catch (err: any) {
      console.error("Login error caught:", err);
      setError(err.message || "Login error");
    }
  };

  // Password validation function
  const validatePassword = (password: string) => {
    const validation = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handleSignUp = async () => {
    try {
      if (!signupEmail || !signupPassword || !signupUsername || !confirmPassword) {
        setError("All fields are required");
        return;
      }

      // Validate password strength
      if (!validatePassword(signupPassword)) {
        setError("Password does not meet security requirements");
        setShowPasswordRequirements(true);
        return;
      }

      if (signupPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // First, sign up the user
      const signupResult = await authService.signup({
        email: signupEmail,
        password: signupPassword,
        username: signupUsername,
        confirmPassword: confirmPassword,
      });

      // console.log("Signup result:", signupResult);

      // Check if signup was successful
      if (signupResult?.message === "Signup successful" || 
          signupResult?.message === "User created successfully" ||
          signupResult?.status === "success" ||
          signupResult?.success === true) {
        
        // If signup successful, automatically log them in
        try {
          const loginResult = await authService.login({ 
            email: signupEmail, 
            password: signupPassword 
          });

          // console.log("Auto-login result:", loginResult);

          if (loginResult?.message === "Login successful") {
            // Store user data from login response
            localStorage.setItem("username", loginResult.username || signupUsername);
            localStorage.setItem("userEmail", signupEmail);
            
            // Store authentication tokens if provided
            if (loginResult.token) {
              localStorage.setItem("token", loginResult.token);
            }
            if (loginResult.userId || loginResult.user?.id) {
              localStorage.setItem("userId", loginResult.userId || loginResult.user.id);
            }
            
            setError("");
            navigate("/home");
          } else {
            // Login failed after successful signup - still navigate but show a message
            localStorage.setItem("username", signupUsername);
            localStorage.setItem("userEmail", signupEmail);
            setError("Account created successfully! Please log in.");
            setActiveTab("login"); // Switch to login tab
          }
        } catch (loginErr: any) {
          console.error("Auto-login error:", loginErr);
          // Signup successful but auto-login failed
          localStorage.setItem("username", signupUsername);
          localStorage.setItem("userEmail", signupEmail);
          setError("Account created successfully! Please log in.");
          setActiveTab("login"); // Switch to login tab
          setLoginEmail(signupEmail); // Pre-fill email for convenience
        }
      } else {
        console.warn("Unexpected signup result:", signupResult);
        setError(signupResult?.message || "Signup failed");
      }
    } catch (err: any) {
      console.error("Signup error caught:", err);
      setError(err.message || "Signup error");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setError("Email is required");
      return;
    }
    setError("");
    try {
      const result = await authService.forgotPassword(forgotEmail);
      setError("If this email exists, reset instructions have been sent.");
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset instructions");
    }
  };

  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const username = localStorage.getItem("username");
    if (!username) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };

  // Silk background color for light/dark mode
  const silkBg =
    theme === "light"
      ? [1, 1, 1] as [number, number, number]
      : [0.0078, 0.031, 0.090] as [number, number, number]

  return (
    <main className={`min-h-screen flex flex-col ${theme === "light" ? "bg-white text-black" : "bg-muted/30 text-white"}`}>
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Silk/Brand Section */}
        <div className="relative w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center text-center order-1 lg:order-1 min-h-[300px] lg:min-h-screen overflow-hidden">
          <div className="absolute inset-0">
            <Silk speed={1} bgColor={silkBg} /> {/* <-- Pass bgColor */}
          </div>
          <div className="relative z-10 max-w-sm sm:max-w-md mx-auto">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="bg-[#00876e]/10 p-3 sm:p-4 rounded-full">
                <BrainCircuit className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${theme === "light" ? "text-black" : "text-white"}`} />
              </div>
            </div>

            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wider mb-2 ${theme === "light" ? "text-black" : "text-white"}`}>
              Prompt Forge
            </h1>
            <p className={`text-xs sm:text-sm ${theme === "light" ? "text-black/70" : "text-white/70"} uppercase tracking-widest mb-6 sm:mb-8`}>
              Forge the future
            </p>

            <h2 className={`text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 leading-tight ${theme === "light" ? "text-black" : "text-white"}`}>
              Discover, Test & Master <br className="hidden sm:block" /> 
              <span className="sm:hidden">& </span>AI Prompts
            </h2>

            <p className={`text-xs sm:text-sm lg:text-base ${theme === "light" ? "text-black/80" : "text-white/80"} mb-4 sm:mb-6 leading-relaxed px-2`}>
              The marketplace for high-quality, tested AI prompts. 
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Buy, sell, test, and compare prompts to maximize 
              <br className="hidden sm:block" />your AI potential.
            </p>
          </div>
        </div>

        {/* Right Login Section */}
        <div
          className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-16 order-2 lg:order-2 min-h-[300px] lg:min-h-screen relative"
        >
          {/* Muted translucent background */}
          <div className="absolute inset-0 pointer-events-none z-0" />
          <Card
            className={`w-full max-w-sm sm:max-w-md lg:max-w-lg shadow-lg z-10 transition-all duration-700 ${
              rightLoaded
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-16"
            }`}
          >
            <div className="p-4 sm:p-6 lg:p-8">
              {showForgotPassword ? (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError("");
                    }}
                    className="flex items-center text-sm text-muted-foreground hover:text-[#3ebb9e] mb-4 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to login
                  </button>

                  <h2 className="text-lg sm:text-xl font-semibold mb-2">Reset Password</h2>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>

                  <div className="space-y-2">
                    <label className="text-labelText px-1 text-sm">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="bg-muted border-muted h-10 sm:h-11 text-sm"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full bg-[#3ebb9e] hover:bg-[#00674f] h-10 sm:h-11 text-sm sm:text-base" 
                    onClick={handleForgotPassword}
                  >
                    Send Reset Instructions
                  </Button>
                </div>
              ) : (
                <>
                  {/* Tab Navigation */}
                  <div className="flex border-b border-border mb-4 sm:mb-6 justify-center">
                    <button
                      className={`px-3 sm:px-4 py-3 sm:py-4 lg:py-5 text-sm sm:text-base font-medium w-1/2 transition-colors ${
                        activeTab === "login" ? "border-b-2 border-[#3ebb9e] text-[#3ebb9e]" : "text-labelText hover:text-[#3ebb9e]"
                      }`}
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                    <button
                      className={`px-3 sm:px-4 py-3 sm:py-4 lg:py-5 text-sm sm:text-base font-medium w-1/2 transition-colors ${
                        activeTab === "signup" ? "border-b-2 border-[#3ebb9e] text-[#3ebb9e]" : "text-labelText hover:text-[#3ebb9e]"
                      }`}
                      onClick={() => setActiveTab("signup")}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* Login Form */}
                  {activeTab === "login" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-labelText px-1 text-sm">Email</label>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-muted border-muted h-10 sm:h-11 text-sm"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-labelText px-1 text-sm">Password</label>
                        <div className="relative">
                          <Input
                            type={toggleLoginPassword ? "text" : "password"}
                            placeholder="Password"
                            className="bg-muted border-muted h-10 sm:h-11 pr-10 sm:pr-12 w-full text-sm"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {toggleLoginPassword ? (
                              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-[#3ebb9e] transition-colors" onClick={() => setToggleLoginPassword(false)} />
                            ) : (
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-[#3ebb9e] transition-colors" onClick={() => setToggleLoginPassword(true)} />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground mt-4 items-center">
                      </div>

                      <Button 
                        className="w-full bg-[#3ebb9e] hover:bg-[#00674f] h-10 sm:h-11 text-sm sm:text-base transition-all" 
                        onClick={handleLogin}
                      >
                        Login
                      </Button>

                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                        <div className="flex-grow border-t border-border"></div>
                      </div>

                        <div style={{ display: "flex", justifyContent: "center", minWidth: 250, width: "100%" }}>
                          <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                              try {
                                const result = await authService.googleLogin(credentialResponse.credential!);
                                if (result?.message === "Google login successful") {
                                  if (result.username) localStorage.setItem("username", result.username);
                                  if (result.userId) localStorage.setItem("userId", result.userId);
                                  if (result.email) localStorage.setItem("userEmail", result.email);
                                  if (result.token) localStorage.setItem("token", result.token); // Store JWT token
                                  setError("");
                                  navigate("/home");
                                } else {
                                  setError("Google login failed");
                                }
                              } catch (err: any) {
                                setError(err.message || "Google login error");
                              }
                            }}
                            onError={() => setError("Google login failed")}
                          />
                        </div>
                    </div>
                  )}

                  {/* Sign Up Form */}
                  {activeTab === "signup" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-labelText px-1 text-sm">Username</label>
                        <Input
                          type="text"
                          placeholder="Username"
                          className="bg-muted border-muted h-10 sm:h-11 text-sm"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-labelText px-1 text-sm">Email</label>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-muted border-muted h-10 sm:h-11 text-sm"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          onBlur={() => {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (signupEmail && !emailRegex.test(signupEmail)) {
                              setError("Please enter a valid email address");
                            } else {
                              setError("");
                            }
                          }}
                        />
                        {signupEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail) && (
                          <div className="text-xs text-red-500 mt-1">Please enter a valid email address</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-labelText px-1 text-sm">Password</label>
                        <div className="relative">
                          <Input
                            type={togglePassword ? "text" : "password"}
                            placeholder="Password"
                            className="bg-muted border-muted h-10 sm:h-11 pr-10 sm:pr-12 w-full text-sm"
                            value={signupPassword}
                            onChange={(e) => {
                              setSignupPassword(e.target.value);
                              validatePassword(e.target.value);
                              setShowPasswordRequirements(e.target.value.length > 0);
                            }}
                            onFocus={() => setShowPasswordRequirements(true)}
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {togglePassword ? (
                              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-[#3ebb9e] transition-colors" onClick={() => setTogglePassword(false)} />
                            ) : (
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-[#3ebb9e] transition-colors" onClick={() => setTogglePassword(true)} />
                            )}
                          </div>
                        </div>
                        
                        {/* Password Requirements - Mobile Optimized */}
                        {showPasswordRequirements && signupPassword.length > 0 && !Object.values(passwordValidation).every(Boolean) && (
                          <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password requirements:</p>
                            <div className="space-y-1">
                              <div className={`flex items-center text-xs ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                                <span className="mr-2 w-3 text-center">{passwordValidation.hasMinLength ? '✓' : '○'}</span>
                                <span className="text-xs">At least 8 characters</span>
                              </div>
                              <div className={`flex items-center text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                                <span className="mr-2 w-3 text-center">{passwordValidation.hasUppercase ? '✓' : '○'}</span>
                                <span className="text-xs">One uppercase letter</span>
                              </div>
                              <div className={`flex items-center text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                                <span className="mr-2 w-3 text-center">{passwordValidation.hasLowercase ? '✓' : '○'}</span>
                                <span className="text-xs">One lowercase letter</span>
                              </div>
                              <div className={`flex items-center text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                                <span className="mr-2 w-3 text-center">{passwordValidation.hasNumber ? '✓' : '○'}</span>
                                <span className="text-xs">One number</span>
                              </div>
                              <div className={`flex items-center text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                                <span className="mr-2 w-3 text-center">{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                                <span className="text-xs">One special character</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show success message when all requirements are met */}
                        {showPasswordRequirements && signupPassword.length > 0 && Object.values(passwordValidation).every(Boolean) && (
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <span className="mr-2">✓</span>
                              Password meets all requirements
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-labelText px-1 text-sm">Confirm Password</label>
                        <div className="relative">
                          <Input
                            type={toggleConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="bg-muted border-muted h-10 sm:h-11 pr-10 sm:pr-12 w-full text-sm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {toggleConfirmPassword ? (
                              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-[#3ebb9e] transition-colors" onClick={() => setToggleConfirmPassword(false)} />
                            ) : (
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-[#3ebb9e] transition-colors" onClick={() => setToggleConfirmPassword(true)} />
                            )}
                          </div>
                        </div>
                        {/* Password match indicator */}
                        {confirmPassword && (
                          <div className={`text-xs mt-1 flex items-center ${signupPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                            <span className="mr-1">{signupPassword === confirmPassword ? '✓' : '✗'}</span>
                            {signupPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                          </div>
                        )}
                      </div>
                      <Button 
                        className="w-full bg-[#3ebb9e] hover:bg-[#00674f] h-10 sm:h-11 text-sm sm:text-base transition-all" 
                        onClick={handleSignUp}
                      >
                        Sign Up
                      </Button>

                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                        <div className="flex-grow border-t border-border"></div>
                      </div>

                        <div style={{ display: "flex", justifyContent: "center", minWidth: 250, width: "100%" }}>
                          <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                              try {
                                const result = await authService.googleLogin(credentialResponse.credential!);
                                if (result?.message === "Google login successful") {
                                  if (result.username) localStorage.setItem("username", result.username);
                                  if (result.userId) localStorage.setItem("userId", result.userId);
                                  if (result.email) localStorage.setItem("userEmail", result.email);
                                  if (result.token) localStorage.setItem("token", result.token); // Store JWT token
                                  setError("");
                                  navigate("/home");
                                } else {
                                  setError("Google login failed");
                                }
                              } catch (err: any) {
                                setError(err.message || "Google login error");
                              }
                            }}
                            onError={() => setError("Google login failed")}
                          />
                        </div>
                    </div>
                  )}
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
