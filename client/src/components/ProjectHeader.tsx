"use client"

import { Search, Plus, Bell, HelpCircle, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "@/config/axiosConfig";

export function ProjectHeader({
  sidebarTrigger,
}: {
  sidebarTrigger: React.ReactNode;
}) {
  const signinGG = async () => {
    // const response = await axios.get(`/users/signin-google`)
    window.location.href = "http://localhost:5144/users/signin-google"
  }

  return (
    <>
      <header className="flex items-end justify-between px-4 py-2 bg-white border-b border-gray-200 z-50 relative max-w-7xl mx-auto w-full">
        {" "}
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {sidebarTrigger}
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">J</span>
            </div>
            <span className="text-gray-900 font-medium">Jira</span>
          </div>
        </div>
        <div className="flex-1 w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-6" />
            <Input
              placeholder="Search"
              className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Button className="bg-red-500 hover:bg-red-700 text-white" onClick={signinGG}>Google</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <span className="text-sm">Premium trial</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              BK
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
    </>
  );
}
