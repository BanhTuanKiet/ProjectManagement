"use client"

import { useState } from "react"
import { Plus, Trash2, UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Team {
  id: number
  name: string
  description: string
  memberCount: number
  color: string
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: "Frontend", description: "UI/UX Development", memberCount: 4, color: "bg-blue-100" },
    { id: 2, name: "Backend", description: "API & Database", memberCount: 3, color: "bg-purple-100" },
    { id: 3, name: "Design", description: "Design & Branding", memberCount: 2, color: "bg-pink-100" },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: "", description: "", color: "bg-blue-100" })

  const handleAddTeam = () => {
    if (newTeam.name) {
      setTeams([
        ...teams,
        {
          id: teams.length + 1,
          ...newTeam,
          memberCount: 0,
        },
      ])
      setNewTeam({ name: "", description: "", color: "bg-blue-100" })
      setShowAddForm(false)
    }
  }

  const handleDeleteTeam = (id: number) => {
    setTeams(teams.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Teams</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={16} className="mr-2" />
          Create Team
        </Button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
          <input
            type="text"
            placeholder="Team Name"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Team Description"
            value={newTeam.description}
            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <select
            value={newTeam.color}
            onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bg-blue-100">Blue</option>
            <option value="bg-purple-100">Purple</option>
            <option value="bg-pink-100">Pink</option>
            <option value="bg-green-100">Green</option>
            <option value="bg-yellow-100">Yellow</option>
          </select>
          <div className="flex gap-2">
            <Button onClick={handleAddTeam} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Create Team
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div key={team.id} className={`p-4 rounded-lg border border-gray-200 ${team.color}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{team.name}</h4>
                <p className="text-sm text-gray-600">{team.description}</p>
              </div>
              <button
                onClick={() => handleDeleteTeam(team.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
              <UsersIcon size={14} />
              <span>{team.memberCount} members</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
