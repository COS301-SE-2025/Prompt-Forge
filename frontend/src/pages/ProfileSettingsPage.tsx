import { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { Switch } from "../components/ui/Switch"
import { Textarea } from "../components/ui/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select"
import { Camera, Check, Save, Trash, Upload, X, Plus } from "lucide-react"

export default function ProfileSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileImage, setProfileImage] = useState<string>(() => {
    // Initialize from localStorage if exists
    return localStorage.getItem('userProfileImage') || "/placeholder.svg?height=100&width=100"
  })
  const [saveStatus, setSaveStatus] = useState<null | "saving" | "success" | "error">(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setProfileImage(base64String)
        localStorage.setItem('userProfileImage', base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage("/placeholder.svg?height=100&width=100")
    localStorage.removeItem('userProfileImage')
  }

  const handleSave = () => {
    setSaveStatus("saving")
    setTimeout(() => {
      setSaveStatus("success")
      setTimeout(() => setSaveStatus(null), 2000)
    }, 1000)
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
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
                            src={profileImage}
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
                          <Input id="username" defaultValue="theo_unknown" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="display-name">Display Name</Label>
                          <Input id="display-name" defaultValue="Theo" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="markdavis@gmail.com" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself"
                          defaultValue="AI prompt engineer specializing in creative writing and technical documentation. I create prompts that help writers and developers get the most out of AI tools."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        {saveStatus === "saving" && (
                          <span className="text-sm text-muted-foreground">Saving changes...</span>
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
                      <Button onClick={handleSave} className="bg-[#3ebb9e] hover:bg-[#00674f]">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">Social Links</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input id="twitter" placeholder="@username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <Input id="github" placeholder="username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input id="linkedin" placeholder="profile-url" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="https://yourwebsite.com" />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleSave} className="bg-[#3ebb9e] hover:bg-[#00674f]">
                      <Save className="h-4 w-4 mr-2" />
                      Save Links
                    </Button>
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
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button className="bg-[#3ebb9e] hover:bg-[#00674f]">Update Password</Button>
                  </div>
                </Card>

                <Card className="p-6">
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
                </Card>

                <Card className="p-6 border-red-200">
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
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
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

                  <div>
                    <h3 className="font-medium mb-3">In-App Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="app-prompts" className="flex-1">
                          Prompt Updates
                        </Label>
                        <Switch id="app-prompts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="app-followers" className="flex-1">
                          New Followers
                        </Label>
                        <Switch id="app-followers" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="app-comments" className="flex-1">
                          Comments on Your Prompts
                        </Label>
                        <Switch id="app-comments" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="app-sales" className="flex-1">
                          Prompt Sales
                        </Label>
                        <Switch id="app-sales" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="app-announcements" className="flex-1">
                          Platform Announcements
                        </Label>
                        <Switch id="app-announcements" defaultChecked />
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
            </TabsContent>

            <TabsContent value="billing">
              <div className="grid gap-6">
                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">Subscription</h2>

                  <div className="bg-muted p-4 rounded-md mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Pro Plan</h3>
                        <p className="text-sm text-muted-foreground">$19.99/month, renews on June 15, 2025</p>
                      </div>
                      <Button variant="outline">Change Plan</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Plan Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-[#3ebb9e] mr-2" />
                        <span>Unlimited prompt testing</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-[#3ebb9e] mr-2" />
                        <span>Access to all AI models</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-[#3ebb9e] mr-2" />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-[#3ebb9e] mr-2" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button variant="outline" className="text-red-500 hover:bg-red-500/10 hover:text-red-600">
                      Cancel Subscription
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">Payment Methods</h2>

                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-6 bg-blue-500 rounded mr-3"></div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-xs text-muted-foreground">Expires 12/25</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">Billing History</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Pro Plan - Monthly</p>
                        <p className="text-xs text-muted-foreground">May 15, 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$19.99</p>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Pro Plan - Monthly</p>
                        <p className="text-xs text-muted-foreground">April 15, 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$19.99</p>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Pro Plan - Monthly</p>
                        <p className="text-xs text-muted-foreground">March 15, 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$19.99</p>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button variant="link">View All Invoices</Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="api">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">API Keys</h2>

                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Production Key</h3>
                      <Button variant="outline" size="sm">
                        Regenerate
                      </Button>
                    </div>
                    <div className="bg-card p-2 rounded border border-border font-mono text-sm mb-2">
                      pf_live_••••••••••••••••••••••••••••••
                    </div>
                    <p className="text-xs text-muted-foreground">Created on January 15, 2025</p>
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Development Key</h3>
                      <Button variant="outline" size="sm">
                        Regenerate
                      </Button>
                    </div>
                    <div className="bg-card p-2 rounded border border-border font-mono text-sm mb-2">
                      pf_test_••••••••••••••••••••••••••••••
                    </div>
                    <p className="text-xs text-muted-foreground">Created on January 15, 2025</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">API Usage</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>This Month</span>
                        <span>1,245 / 5,000 calls</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-[#3ebb9e] rounded-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="bg-[#3ebb9e] hover:bg-[#00674f]">View API Documentation</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
