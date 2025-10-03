'use client'

import { ChevronDown } from 'lucide-react'

export default function Page() {
  const projects = [
    {
      id: 1,
      name: 'Project',
      description: 'Team-managed software',
      avatar: '👤',
      avatarBg: 'bg-blue-100',
      openItems: 2,
      doneItems: 0,
      boards: 1
    },
    {
      id: 2,
      name: '(Learn) Jira Premium be...',
      description: 'Team-managed software',
      avatar: '🎯',
      avatarBg: 'bg-purple-100',
      openItems: 0,
      doneItems: 0,
      boards: 1
    }
  ]

  const tabs = [
    { name: 'Worked on', active: false, count: null },
    { name: 'Viewed', active: true, count: null },
    { name: 'Assigned to me', active: false, count: 2 },
    { name: 'Starred', active: false, count: null },
    { name: 'Boards', active: false, count: null }
  ]

  return (
    <div className="max-w-6xl mx-3 p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">For you</h1>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Recent projects</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all projects
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-8 h-8 rounded ${project.avatarBg} flex items-center justify-center text-sm`}>
                  {project.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Quick links</h4>
                
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700">My open work items</span>
                  <span className="text-sm font-medium text-gray-900">{project.openItems}</span>
                </div>
                
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700">Done work items</span>
                </div>
                
                <div className="flex items-center justify-between py-1">
                  <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900">
                    <span>{project.boards} board</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                tab.active
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}