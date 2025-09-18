'use client'
import type { DragEndEvent } from '@/components/ui/shadcn-io/list'
import {
  ListGroup,
  ListHeader,
  ListItem,
  ListItems,
  ListProvider,
} from '@/components/ui/shadcn-io/list'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BasicTask } from '@/utils/ITask'
import { taskStatus } from '@/utils/statusUtils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'

const TaskList = ({ tasks }: { tasks: BasicTask[] }) => {
  const [features, setFeatures] = useState<BasicTask[]>([])

  useEffect(() => {
    if (!tasks) return
    setFeatures(tasks)
  }, [tasks])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const newStatus = over.id as string

    setFeatures((prev) =>
      prev.map((feature) =>
        feature.taskId === active.id ? { ...feature, status: newStatus } : feature
      )
    )
  }

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
    <ListProvider onDragEnd={handleDragEnd}>
      {taskStatus.map((status) => (
        <ListGroup id={status.name} key={status.name}>
          <ListHeader color={status.color} name={status.name} />
          <ListItems className='p-0'>
            {features
              .filter((f) => f.status === status.name)
              .map((feature, index) => (
                <ListItem
                  id={feature.taskId.toString()}
                  index={index}
                  key={feature.taskId}
                  name={feature.title}
                  parent={feature.status}
                  className="w-full"
                >
                  <div className="flex items-center gap-2 bg-muted/50 text-xs w-full">
                    <span className="flex-1 min-w-0 truncate">
                      {feature.title}
                    </span>
                    {feature.assignee && (
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-blue-500 text-white">
                          {feature.assignee
                            ?.split(' ')
                            .map((word) => word[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

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
                  </div>
                </ListItem>
              ))}
          </ListItems>
        </ListGroup>
      ))}
    </ListProvider>
  )
}

export default TaskList