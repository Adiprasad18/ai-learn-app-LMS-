"use client";

import { useUser } from "@clerk/nextjs";
import { User, Mail, Calendar, Settings, Shield, Bell, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Profile Card with Avatar */}
      <Card className="border-2 border-indigo-100 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600 mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  Free Plan
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Full Name</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Email Address</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Crown className="h-5 w-5" />
              Account Status
            </CardTitle>
            <CardDescription>
              Your current plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Current Plan</span>
              <span className="font-bold text-indigo-600">Free Tier</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Courses Created</span>
              <span className="font-bold text-gray-900">Unlimited</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">AI Generations</span>
              <span className="font-bold text-green-600">Unlimited</span>
            </div>
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
              <p className="text-sm font-medium mb-2">🎉 All Features Unlocked</p>
              <p className="text-xs opacity-90">You have access to all AI-powered learning features</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security & Preferences */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-600">Last changed 30 days ago</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Course updates and reminders</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-indigo-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Progress Reports</p>
                <p className="text-sm text-gray-600">Weekly learning summaries</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-indigo-600" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-2 border-red-200 shadow-md">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
