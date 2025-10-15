import { Bell, Check, MessageCircle, Users, Shrink as Sprint, Flag } from "lucide-react"

export const taskStatus = [
    { id: 1, name: 'Todo', color: '#3B82F6' },      // gray
    { id: 2, name: 'In Progress', color: '#FACC15' }, // yellow
    { id: 3, name: 'Done', color: '#10B981' },       // green
    { id: 4, name: 'Cancel', color: '#F97316' },     // orange
    { id: 5, name: 'Expired', color: '#EF4444' },    // red
]

export const getBorderColor = (status: string) => {
    switch (status) {
        case 'Todo':
            return 'border border-blue-500'
        case 'In Progress':
            return 'border border-yellow-400'
        case 'Done':
            return 'border border-green-500'
        case 'Cancel':
            return 'border border-orange-400'
        case 'Expired':
            return 'border border-red-500'
        default:
            return 'border border-slate-300'
    }
}

export const getCheckboxColor = (status: string) => {
    switch (status) {
        case 'Todo':
            return 'border-blue-500 data-[state=checked]:bg-blue-500'
        case 'In Progress':
            return 'border-yellow-400 data-[state=checked]:bg-yellow-400'
        case 'Done':
            return 'border-green-500 data-[state=checked]:bg-green-500'
        case 'Cancel':
            return 'border-orange-400 data-[state=checked]:bg-orange-400'
        case 'Expired':
            return 'border-red-500 data-[state=checked]:bg-red-500'
        default:
            return 'border-slate-400 data-[state=checked]:bg-slate-400'
    }
}

export const getRoleBadge = (role: string) => {
    switch (role) {
        case "Project Manager":
            return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        case "Leader":
            return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        default:
            return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:slate-blue-200'
    }
}

export const getPriorityBadge = (priority: string) => {
    switch (priority) {
        case "high":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        case "medium":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        case "low":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        case "all": // dùng khi filter, có thể style neutral
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
        default:
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
}

export const getTaskStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case "all":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
        case "todo":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        case "in progress":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        case "done":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        case "cancel":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
        case "expired":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        default:
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
    }
}

export const getNotificationIcon = (type: string) => {
    switch (type.toLocaleLowerCase()) {
        case "task":
            return (
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-emerald-600" />
                </div>
            )
        case "comment":
            return (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                </div>
            )
        case "sprint":
            return (
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sprint className="h-4 w-4 text-purple-600" />
                </div>
            )
        case "team":
            return (
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-orange-600" />
                </div>
            )
        default:
            return (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell className="h-4 w-4 text-gray-600" />
                </div>
            )
    }
}

export const getPriorityIcon = (priority: string | number) => {
    const level = {
        1: "high",
        2: "medium",
        3: "low"
    }[Number(priority)]

    switch (level) {
        case "high":
            return <Flag className="h-4 w-4 text-red-500" />
        case "medium":
            return <Flag className="h-4 w-4 text-orange-500" />
        case "low":
            return <Flag className="h-4 w-4 text-green-500" />
        default:
            return <Flag className="h-4 w-4 text-gray-400" />
    }
}

export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "todo":
            return "bg-blue-100 text-blue-700 hover:bg-blue-100"
        case "in progress":
            return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
        case "done":
            return "bg-green-100 text-green-700 hover:bg-green-100"
        case "expired":
            return "bg-red-100 text-red-700 hover:bg-red-100"
        default:
            return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    }
}