import { BasicTask } from '@/utils/ITask'
import { taskStatus } from '@/utils/statusUtils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MoreVertical } from 'lucide-react'
import React from 'react'

export default function TaskDropdownMenu({ feature, setFeatures }: { feature: BasicTask, setFeatures: React.Dispatch<React.SetStateAction<BasicTask[]>> }) {
  const handleAction = (taskId: string, action: string) => {
    if (action === 'edit') {
      console.log('Edit task', taskId)
    }
    if (action === 'delete') {
      console.log('Delete task', taskId)
    }
    if (action.startsWith('status:')) {
      const newStatus = action.split(':')[1]
      setFeatures((prev) =>
        prev.map((feature) =>
          feature.taskId.toString() === taskId ? { ...feature, status: newStatus } : feature
        )
      )
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded hover:bg-muted">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => handleAction(feature.taskId.toString(), 'edit')}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction(feature.taskId.toString(), 'delete')}
        >
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Change status</DropdownMenuLabel>
        {taskStatus.map((s) => (
          <DropdownMenuItem
            key={s.id}
            onClick={() =>
              handleAction(feature.taskId.toString(), `status:${s.name}`)
            }
          >
            {s.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
