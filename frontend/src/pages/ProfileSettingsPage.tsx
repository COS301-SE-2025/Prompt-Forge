import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { Switch } from "../components/ui/Switch"
import { Textarea } from "../components/ui/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select"
import { Camera, Check, Save, Trash, Upload, X, CreditCard, Trash2, Plus } from "lucide-react"
import { profileService } from "../services/profileServices"
import PaymentOverlay from "@/components/PaymentOverlay"
import { BankIdentifier, PayoutCard } from "@/Models/Payout"
import BankCard from "@/components/BankCard"
import { getCardColor } from "@/Models/BankCard"

export default function ProfileSettingsPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  
  // Saved state
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg?height=100&width=100")
  const [username, setUsername] = useState<string>("") // Fixed: uncommented username
  const [email, setEmail] = useState<string>("")
  const [bio, setBio] = useState<string>("")
  
  // Pending (unsaved) state
  const [pendingProfileImage, setPendingProfileImage] = useState<string>("/placeholder.svg?height=100&width=100")
  const [pendingUsername, setPendingUsername] = useState<string>("")
  const [pendingEmail, setPendingEmail] = useState<string>("")
  const [pendingBio, setPendingBio] = useState<string>("")
  const [pendingProfileImageFile, setPendingProfileImageFile] = useState<File | null>(null)
  const [saveStatus, setSaveStatus] = useState<null | "saving" | "success" | "error">(null)
  const [loading, setLoading] = useState<boolean>(true)

  //bank details
  const [payoutDetails, setPayoutDetails] = useState<PayoutCard | null>(null)
  const [bankList, setBankList] = useState<Array<BankIdentifier>>([])
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false)

  // password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<null | "saving" | "success" | "error">(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const username = localStorage.getItem('username')
        if (!username || username === 'Guest') {
          navigate('/login')
          return
        }
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        navigate('/login')
      } finally {
        setAuthLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

  // Load profile data on mount
  useEffect(() => {
    if (!isAuthenticated) return
    
    async function fetchProfile() {
      try {
        setLoading(true)
        const [profile, bankList] = await Promise.all([
          profileService.getCurrentProfile(),
          profileService.getBankList()
        ]);

        setBankList(bankList);
        
        // Fetch payout details separately with error handling
        try {
          const payoutDetails = await profileService.getPayoutDetails();
          setPayoutDetails(payoutDetails);
        } catch (error) {
          setPayoutDetails(null);
        }

        setUsername(profile.username || "")
        setEmail(profile.email || "")
        setBio(profile.bio || "")
        setProfileImage(profile.profilePicture || "/placeholder.svg?height=100&width=100")
        
        // Set pending state to match loaded profile
        setPendingUsername(profile.username || "")
        setPendingEmail(profile.email || "")
        setPendingBio(profile.bio || "")
        setPendingProfileImage(profile.profilePicture || "/placeholder.svg?height=100&width=100")
      } catch (error) {
        console.error("Failed to load profile", error)
        // You might want to show an error message to the user here
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Show loading state while fetching profile
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Only update pending image, not saved
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setPendingProfileImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setPendingProfileImageFile(file)
  }

  // Remove image in pending state
  const handleRemoveImage = () => {
    setPendingProfileImage("/placeholder.svg?height=100&width=100")
    setPendingProfileImageFile(null)
  }

  // Update pending state only
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPendingBio(e.target.value)
  }
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingUsername(e.target.value)
  }
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingEmail(e.target.value)
  }

  // Save changes: upload image if changed, then update profile
  const handleSave = async () => {
    try {
      setSaveStatus("saving");

      let imageUrl = pendingProfileImage;

      if (pendingProfileImageFile) {
        // If there's a new file, upload it and get the URL
        imageUrl = await profileService.uploadProfilePicture(pendingProfileImageFile);
      } else if (
        pendingProfileImage === "/placeholder.svg?height=100&width=100" &&
        profileImage !== pendingProfileImage
      ) {
        // If user removed the image
        await profileService.deleteProfilePicture();
        imageUrl = ""; // empty to trigger backend deletion logic
      }

      await profileService.updateCurrentProfile({
        username: pendingUsername,
        bio: pendingBio,
        email: pendingEmail,
        profilePicture: imageUrl,
      });

      // Update saved state only if successful
      setUsername(pendingUsername); // Fixed: uncommented
      setEmail(pendingEmail);
      setBio(pendingBio);
      setProfileImage(imageUrl);
      setPendingProfileImageFile(null);

      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error("Save failed", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    try {
      setPasswordStatus("saving");
      await profileService.changePassword(currentPassword, newPassword);
      setPasswordStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus(null), 2000);
    } catch (err: any) {
      setPasswordStatus("error");
      setPasswordError(err.message || "Failed to change password");
      setTimeout(() => setPasswordStatus(null), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid gap-6">
                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">Profile Information</h2>

                  <div className="flex flex-col md:flex-row gap-8 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                          <img
                            src={pendingProfileImage}
                            alt="Profile"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div
                          className="absolute -bottom-2 -right-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="bg-[#3ebb9e] rounded-full p-1.5 cursor-pointer">
                            <Camera className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={handleRemoveImage}
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={pendingUsername}
                            onChange={handleUsernameChange}
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={pendingEmail}
                          onChange={handleEmailChange}
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself"
                          value={pendingBio}
                          onChange={handleBioChange}
                          className="min-h-[100px] bg-muted border focus:ring-2 focus:ring-[#3ebb9e]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        {saveStatus === "saving" && (
                          <span className="text-sm text-blue-500 flex items-center">
                            Saving changes...
                          </span>
                        )}
                        {saveStatus === "success" && (
                          <span className="text-sm text-green-500 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Changes saved successfully
                          </span>
                        )}
                        {saveStatus === "error" && (
                          <span className="text-sm text-red-500 flex items-center">
                            <X className="h-4 w-4 mr-1" />
                            Error saving changes
                          </span>
                        )}
                      </div>
                      <Button 
                        onClick={handleSave} 
                        className="bg-[#3ebb9e] hover:bg-[#00674f]"
                        disabled={saveStatus === "saving"}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="account">
              <div className="grid gap-6">
                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">Account Settings</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    {passwordError && (
                      <div className="text-red-500 text-sm">{passwordError}</div>
                    )}
                    {passwordStatus === "success" && (
                      <div className="text-green-500 text-sm">Password updated!</div>
                    )}
                    <div className="mt-6 flex justify-end">
                      <Button
                        className="bg-[#3ebb9e] hover:bg-[#00674f]"
                        onClick={handleChangePassword}
                        disabled={passwordStatus === "saving"}
                      >
                        {passwordStatus === "saving" ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">Privacy Settings</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Profile Visibility</h3>
                        <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="followers">Followers Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Activity Status</h3>
                        <p className="text-sm text-muted-foreground">Let others know when you're active</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Allow Prompt Sharing</h3>
                        <p className="text-sm text-muted-foreground">Let others share your prompts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card> */}

                {/* <Card className="p-6 border-red-200">
                  <h2 className="text-lg font-medium text-red-500 mb-4">Danger Zone</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Deactivate Account</h3>
                        <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-red-200 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      >
                        Deactivate
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button className="min-h-fit" variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </Card> */}
              </div>
            </TabsContent>

            {/* <TabsContent value="notifications">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Notification Preferences</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-prompts" className="flex-1">
                          Prompt Updates
                        </Label>
                        <Switch id="email-prompts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-followers" className="flex-1">
                          New Followers
                        </Label>
                        <Switch id="email-followers" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-comments" className="flex-1">
                          Comments on Your Prompts
                        </Label>
                        <Switch id="email-comments" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-sales" className="flex-1">
                          Prompt Sales
                        </Label>
                        <Switch id="email-sales" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-newsletter" className="flex-1">
                          Newsletter
                        </Label>
                        <Switch id="email-newsletter" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSave} className="bg-[#3ebb9e] hover:bg-[#00674f]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </Card>
            </TabsContent> */}

            <TabsContent value="billing">
              <div className="grid gap-6">
                <Card className="p-0 bg-transparent">
                  <div className="bg-muted p-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-lg font-medium w-fit mb-0">
                      <CreditCard className="inline mr-2" /> Payment Methods
                    </h2>
                  </div>
                  {payoutDetails !== null ? (
                    <div className="space-y-4 bg-transparent rounded-b-lg">
                      <div className="p-4 rounded-b-md bg-muted">
                        {/* Mobile Layout */}
                        <div className="block sm:hidden space-y-4">
                          <div className="flex justify-center">
                            <BankCard
                              payoutCard={payoutDetails}
                              color={getCardColor(payoutDetails?.bank.name.toLowerCase())}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => setIsEditPaymentOpen(true)}
                              className="bg-[#3ebb9e] hover:bg-[#00674f] text-white w-full"
                            >
                              Edit Payment Method
                            </Button>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 sm:items-center">
                          <div className="flex items-center">
                            <BankCard
                              payoutCard={payoutDetails}
                              color={getCardColor(payoutDetails?.bank.name.toLowerCase())}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => setIsEditPaymentOpen(true)}
                              variant="outline"
                              size="sm"
                              className="bg-muted hover:bg-muted/80"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted p-4">
                      <Button
                        onClick={() => setIsAddPaymentOpen(true)}
                        className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Payment Overlays */}
                <PaymentOverlay
                  process="add"
                  bankList={bankList}
                  currentPayoutCard={null}
                  setPaymentCard={setPayoutDetails}
                  isOpen={isAddPaymentOpen}
                  onOpenChange={setIsAddPaymentOpen}
                />

                <PaymentOverlay
                  process="edit"
                  bankList={bankList}
                  currentPayoutCard={payoutDetails}
                  setPaymentCard={setPayoutDetails}
                  isOpen={isEditPaymentOpen}
                  onOpenChange={setIsEditPaymentOpen}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}