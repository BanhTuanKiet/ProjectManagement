"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ProjectSettingsProps {
  projectId?: number
}

export default function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const [settings, setSettings] = useState({
    projectName: "My Project",
    description: "Project description",
    visibility: "private",
    allowPublicAccess: false,
    autoArchiveTasks: true,
    archiveAfterDays: 30,
  })

  const handleChange = (field: string, value: string) => {
    setSettings({ ...settings, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Project Name</label>
        <input
          type="text"
          value={settings.projectName}
          onChange={(e) => handleChange("projectName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
        <textarea
          value={settings.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Visibility</label>
        <select
          value={settings.visibility}
          onChange={(e) => handleChange("visibility", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="private">Private</option>
          <option value="internal">Internal</option>
          <option value="public">Public</option>
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Allow Public Access</p>
            <p className="text-sm text-gray-600">Anyone with link can view</p>
          </div>
          <input
            type="checkbox"
            checked={settings.allowPublicAccess}
            // onChange={(e) => handleChange("allowPublicAccess", e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Auto-Archive Tasks</p>
            <p className="text-sm text-gray-600">Automatically archive completed tasks</p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoArchiveTasks}
            // onChange={(e) => handleChange("autoArchiveTasks", e.target.checked)}
            className="w-4 h-4"
          />
        </div>
      </div>

      {settings.autoArchiveTasks && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Archive After (days)</label>
          <input
            type="number"
            value={settings.archiveAfterDays}
            // onChange={(e) => handleChange("archiveAfterDays", Number.parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="365"
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Save Settings</Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Reset
        </Button>
      </div>
    </div>
  )
}
