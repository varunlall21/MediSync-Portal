
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, KeyRound, Bell, Save } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "In Progress",
      description: "Profile update functionality is not yet implemented.",
    });
  };

  const handleUpdatePassword = () => {
    toast({
      title: "In Progress",
      description: "Password update functionality requires more setup and is not yet implemented.",
    });
  };

  const handleSaveNotificationPrefs = () => {
     toast({
      title: "In Progress",
      description: "Notification preference saving is not yet implemented.",
    });
  };
  
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "";
  const email = user?.email || "";

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-primary" /> Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Your full name" defaultValue={fullName} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" value={email} readOnly className="mt-1 bg-muted/50 cursor-not-allowed" />
            </div>
          </div>
          <Button onClick={handleSaveProfile}>
            <Save className="mr-2 h-4 w-4" /> Save Profile
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary" /> Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" placeholder="••••••••" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" placeholder="••••••••" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input id="confirmNewPassword" type="password" placeholder="••••••••" className="mt-1" />
          </div>
          <Button onClick={handleUpdatePassword}>Update Password</Button>
        </CardContent>
      </Card>
      
      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary" /> Notification Settings</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="emailNotifications" className="flex flex-col cursor-pointer">
                    <span className="font-medium">Email Notifications</span>
                    <span className="text-sm text-muted-foreground">Receive updates about appointments and portal news.</span>
                </Label>
                <Input type="checkbox" id="emailNotifications" className="form-checkbox h-5 w-5 text-primary cursor-pointer" defaultChecked />
            </div>
             <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="smsNotifications" className="flex flex-col cursor-pointer">
                    <span className="font-medium">SMS Reminders</span>
                    <span className="text-sm text-muted-foreground">Get text message reminders for upcoming appointments.</span>
                </Label>
                <Input type="checkbox" id="smsNotifications" className="form-checkbox h-5 w-5 text-primary cursor-pointer" />
            </div>
          <Button onClick={handleSaveNotificationPrefs}>Save Notification Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
