"use client"

import { useState } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface User {
  id: number
  name: string
  email: string
  role: "Admin" | "Member" | "Viewer"
  joinDate: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", joinDate: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Member", joinDate: "2024-02-20" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Viewer", joinDate: "2024-03-10" },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Member" as const })

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([
        ...users,
        {
          id: users.length + 1,
          ...newUser,
          joinDate: new Date().toISOString().split("T")[0],
        },
      ])
      setNewUser({ name: "", email: "", role: "Member" })
      setShowAddForm(false)
    }
  }

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((u) => u.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Users</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newUser.email}
            // onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newUser.role}
            // onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "Admin" | "Member" | "Viewer" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
            <option value="Viewer">Viewer</option>
          </select>
          <div className="flex gap-2">
            <Button onClick={handleAddUser} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Add User
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">Joined {user.joinDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === "Admin"
                    ? "bg-red-100 text-red-700"
                    : user.role === "Member"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-700"
                }`}
              >
                {user.role}
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
