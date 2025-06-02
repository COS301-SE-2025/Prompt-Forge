import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BrainCircuit, Chrome, Eye, EyeOff } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
// import mockAuthService from "@/services/mockAuthService"
import { ToastContainer, toast } from 'react-toastify';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const navigate = useNavigate()
  const [toggleLoginPassword,setToggleLoginPassword] = useState(false);
  const [togglePassword,setTogglePassword] = useState(false);
  const [toggleConfirmPassword,setToggleConfirmPassword] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const signupemailRef = useRef<HTMLInputElement>(null);
  const signuppasswordRef = useRef<HTMLInputElement>(null);
  const confirmpasswordRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    // navigate('/home') // Change from '/features' to '/home'
    e.preventDefault();
    try {
      if(emailRef.current?.value.trim()!=""){
        if(passwordRef.current?.value.trim()!=""){
          try{
          }
          catch(error){
          }
        }
        else{
          notify("error", "Password required")
        }
      }
      else{
        notify("error", "Email required")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const notify = (status: string, message: string) => {
    status == "success" ?
      toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
      :
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
  }

  const handleSignUp = () => {
    navigate('/home') // Change from '/features' to '/home'
  }

  return (
    <main className="min-h-screen flex flex-col">
      <ToastContainer />
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-b from-[#3ebb9e] to-hsl(var(--background)) p-8 flex flex-col justify-center items-center text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="bg-white/10 p-4 rounded-full">
                <BrainCircuit className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2 text-white">Prompt Forge</h1>
            <p className="text-sm text-white/70 uppercase tracking-widest mb-8">Forge the future</p>

            <h2 className="text-xl font-semibold mb-4 text-white">
              Discover, Test & Master
              <br />
              AI Prompts
            </h2>

            <p className="text-sm text-labelText/80 mb-6">
              The marketplace for high-quality, tested AI prompts.
              <br />
              Buy, sell, test, and compare prompts to maximize
              <br />
              your AI potential.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-background p-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <div className="p-6">
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
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="text-labelText px-1">Email</label>
                    <Input refName={emailRef} type="email" placeholder="you@example.com" className="bg-muted border-muted h-11"  />
                  </div>
                  <div className="space-y-2">
                    <label className="text-labelText px-1">Password</label>
                    <div className="relative">
                      <Input refName={passwordRef}
                        type={toggleLoginPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className="bg-muted border-muted h-11 pr-12 w-full" 
                        
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {toggleLoginPassword ? (
                          <EyeOff className="h-5 w-5 cursor-pointer hover:text-gray-700" 
                            onClick={() => setToggleLoginPassword(false)} 
                          />
                        ) : (
                          <Eye className="h-5 w-5 cursor-pointer hover:text-gray-700" 
                            onClick={() => setToggleLoginPassword(true)} 
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground mt-4 items-center">
                    <Link to="#" className="hover:text-forge-green-dark text-forge-green text-sm">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit"
                    className="w-full bg-[#3ebb9e] hover:bg-[#00674f]"
                    // onClick={handleLogin}
                  >
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

                  
                </form>
              )}

              {activeTab === "signup" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-labelText px-1 text-sm">Username</label>
                    <Input  refName={usernameRef} type="text" placeholder="Username" className="bg-muted border-muted h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-labelText px-1 text-sm">Email</label>
                    <Input  refName={signupemailRef} type="email" placeholder="you@example.com" className="bg-muted border-muted h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-labelText px-1">Password</label>
                    <div className="flex items-center cols-2 border-muted bg-muted rounded-md pr-5">
                      <Input  refName={signuppasswordRef} displayBorder={false} type={togglePassword ? "text" : "password"} placeholder="Password" className="bg-muted border-muted h-11" ></Input>
                      {togglePassword ? <EyeOff className="cursor-pointer" onClick={() => setTogglePassword(false)} /> : <Eye className="cursor-pointer" onClick={() => setTogglePassword(true)} />}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-labelText px-1">Confirm Password</label>
                    <div className="flex items-center cols-2 border-muted bg-muted rounded-md pr-5">
                      <Input  refName={confirmpasswordRef} displayBorder={false} type={toggleConfirmPassword ? "text" : "password"} placeholder="Password" className="bg-muted border-muted h-11" ></Input>
                      {toggleConfirmPassword ? <EyeOff className="cursor-pointer" onClick={() => setToggleConfirmPassword(false)} /> : <Eye className="cursor-pointer" onClick={() => setToggleConfirmPassword(true)} />}
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-[#3ebb9e] hover:bg-[#00674f]"
                    onClick={handleSignUp}
                  >
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
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
