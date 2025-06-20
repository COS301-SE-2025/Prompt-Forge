import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { BrainCircuit, Chrome, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { AuthService } from "@/services/authService";

export default function LoginPage() {
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
    try {
      if (!loginEmail || !loginPassword) {
        setError("All fields are required");
        return;
      }

      const result = await authService.login({ email: loginEmail, password: loginPassword });

      if (result.status === "success") {
        localStorage.setItem("username", result.username || "User");
        localStorage.setItem("userEmail", loginEmail);
        setError("");
        navigate("/home");
      } else {
        setError("Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login error");
    }
  };

  const handleSignUp = async () => {
    try {
      if (!signupEmail || !signupPassword || !signupUsername || !confirmPassword) {
        setError("All fields are required");
        return;
      }

      if (signupPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const result = await authService.signup({
        email: signupEmail,
        password: signupPassword,
        username: signupUsername,
        confirmPassword: confirmPassword,
      });

      if (result.status === "success") {
        localStorage.setItem("username", signupUsername);
        localStorage.setItem("userEmail", signupEmail);
        setError("");
        navigate("/home");
      } else {
        setError("Signup failed");
      }
    } catch (err: any) {
      setError(err.message || "Signup error");
    }
  };

  const handleForgotPassword = () => {
    if (!forgotEmail) {
      setError("Email is required");
      return;
    }

    setError("");
    alert(`If this were real, password reset instructions would be sent to ${forgotEmail}`);
    setShowForgotPassword(false);
    setForgotEmail("");
  };

  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const username = localStorage.getItem("username");
    if (!username) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        <div
          className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-center animate-gradient"
          style={{
            backgroundImage: `linear-gradient(-45deg, #3ebb9e, #174037, #020817)`,
            backgroundSize: "400% 400%",
          }}
        >
          <div className="max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="bg-[#00876e]/10 p-4 rounded-full">
                <BrainCircuit className="w-12 h-12 text-white dark:text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2 text-white">
              Prompt Forge
            </h1>
            <p className="text-sm text-white/70 uppercase tracking-widest mb-8">
              Forge the future
            </p>

            <h2 className="text-xl font-semibold mb-4 text-white">
              Discover, Test & Master <br /> AI Prompts
            </h2>

            <p className="text-sm text-white/80 mb-6">
              The marketplace for high-quality, tested AI prompts. <br />
              Buy, sell, test, and compare prompts to maximize <br />
              your AI potential.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-background p-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <div className="p-6">
              {showForgotPassword ? (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError("");
                    }}
                    className="flex items-center text-sm text-muted-foreground hover:text-forge-green mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to login
                  </button>

                  <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>

                  <div className="space-y-2">
                    <label className="text-labelText px-1">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="bg-muted border-muted h-11"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>

                  <Button className="w-full bg-[#3ebb9e] hover:bg-[#00674f]" onClick={handleForgotPassword}>
                    Send Reset Instructions
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex border-b border-border mb-6 justify-center">
                    <button
                      className={`px-4 py-5 text-base font-medium w-1/2 ${
                        activeTab === "login" ? "border-b-2 border-primary text-forge-green" : "text-labelText"
                      }`}
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                    <button
                      className={`px-4 py-5 text-base font-medium w-1/2 ${
                        activeTab === "signup" ? "border-b-2 border-primary text-forge-green" : "text-labelText"
                      }`}
                      onClick={() => setActiveTab("signup")}
                    >
                      Sign Up
                    </button>
                  </div>

                  {activeTab === "login" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-labelText px-1">Email</label>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-muted border-muted h-11"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-labelText px-1">Password</label>
                        <div className="relative">
                          <Input
                            type={toggleLoginPassword ? "text" : "password"}
                            placeholder="Password"
                            className="bg-muted border-muted h-11 pr-12 w-full"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {toggleLoginPassword ? (
                              <EyeOff className="h-5 w-5 cursor-pointer" onClick={() => setToggleLoginPassword(false)} />
                            ) : (
                              <Eye className="h-5 w-5 cursor-pointer" onClick={() => setToggleLoginPassword(true)} />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground mt-4 items-center">
                        <button
                          onClick={() => {
                            setShowForgotPassword(true);
                            setError("");
                          }}
                          className="hover:text-forge-green-dark text-forge-green text-sm"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <Button className="w-full bg-[#3ebb9e] hover:bg-[#00674f]" onClick={handleLogin}>
                        Login
                      </Button>

                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                        <div className="flex-grow border-t border-border"></div>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Chrome className="mr-2 h-4 w-4" />
                        Continue with Google
                      </Button>
                    </div>
                  )}

                  {activeTab === "signup" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-labelText px-1 text-sm">Username</label>
                        <Input
                          type="text"
                          placeholder="Username"
                          className="bg-muted border-muted h-11"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-labelText px-1 text-sm">Email</label>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-muted border-muted h-11"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-labelText px-1">Password</label>
                        <div className="relative">
                          <Input
                            type={togglePassword ? "text" : "password"}
                            placeholder="Password"
                            className="bg-muted border-muted h-11 pr-12 w-full"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {togglePassword ? (
                              <EyeOff className="h-5 w-5 cursor-pointer" onClick={() => setTogglePassword(false)} />
                            ) : (
                              <Eye className="h-5 w-5 cursor-pointer" onClick={() => setTogglePassword(true)} />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-labelText px-1">Confirm Password</label>
                        <div className="relative">
                          <Input
                            type={toggleConfirmPassword ? "text" : "password"}
                            placeholder="Password"
                            className="bg-muted border-muted h-11 pr-12 w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {toggleConfirmPassword ? (
                              <EyeOff className="h-5 w-5 cursor-pointer" onClick={() => setToggleConfirmPassword(false)} />
                            ) : (
                              <Eye className="h-5 w-5 cursor-pointer" onClick={() => setToggleConfirmPassword(true)} />
                            )}
                          </div>
                        </div>
                      </div>
                      <Button className="w-full bg-[#3ebb9e] hover:bg-[#00674f]" onClick={handleSignUp}>
                        Sign Up
                      </Button>

                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                        <div className="flex-grow border-t border-border"></div>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Chrome className="mr-2 h-4 w-4" />
                        Continue with Google
                      </Button>
                    </div>
                  )}
                </>
              )}

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
