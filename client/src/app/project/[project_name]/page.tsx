'use client'

import React, { useState } from 'react';
import {
  Users,
  MoreHorizontal,
  Maximize2,
  Share2,
  Link2,
  Zap,
  Globe,
  BarChart3,
  Calendar,
  List,
  FileText,
  Archive,
  Plus
} from 'lucide-react';
import { useParams } from 'next/navigation';

interface NavigationTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export default function ProjectInterface() {
  const [activeTab, setActiveTab] = useState('board');

  const navigationTabs: NavigationTab[] = [
    { id: 'summary', label: 'Summary', icon: <Globe className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'board', label: 'Board', icon: <div className="w-4 h-4 bg-blue-500 rounded-sm" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'list', label: 'List', icon: <List className="w-4 h-4" /> },
    { id: 'forms', label: 'Forms', icon: <FileText className="w-4 h-4" /> },
    { id: 'archived', label: 'Archived work items', icon: <Archive className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Projects</span>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">P</span>
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Project</h1>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Users className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Maximize2 className="w-4 h-4 text-gray-500" />
              </button>

              <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>

              <button className="p-2 hover:bg-gray-100 rounded">
                <Link2 className="w-4 h-4 text-gray-500" />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded">
                <Zap className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}

            <button className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
              <Plus className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              {navigationTabs.find(tab => tab.id === activeTab)?.icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {navigationTabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p className="text-gray-500">
              <div>
                {activeTab === "board" && <BoardView />}
                {activeTab === "calendar" && <CalendarView />}
                {activeTab === "list" && <ListView />}
              </div>
              Content for {navigationTabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}