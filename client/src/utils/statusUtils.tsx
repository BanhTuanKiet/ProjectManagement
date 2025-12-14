import { Bell, Check, MessageCircle, Users, Shrink as Sprint, Flag, Github, Linkedin, Facebook, LinkIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export const taskStatus = [
    { id: 1, name: 'Todo', color: '#3B82F6' },      // gray
    { id: 2, name: 'In Progress', color: '#FACC15' }, // yellow
    { id: 3, name: 'Done', color: '#10B981' },       // green
    { id: 4, name: 'Cancel', color: '#F97316' },     // orange
    { id: 5, name: 'Expired', color: '#B2BEB5' },    // gray
    { id: 6, name: 'Bug', color: '#EF4444' },        // red
]

export const getBorderColor = (status: string) => {
    switch (status) {
        case 'Todo':
            return 'border border-blue-500'
        case 'In Progress':
            return 'border border-yellow-400'
        case 'Bug':
            return 'border border-red-500'
        case 'Done':
            return 'border border-green-500'
        case 'Cancel':
            return 'border border-orange-400'
        case 'Expired':
            return 'border border-gray-400'
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
        case 'Bug':
            return 'border-red-500 data-[state=checked]:bg-red-500'
        case 'Done':
            return 'border-green-500 data-[state=checked]:bg-green-500'
        case 'Cancel':
            return 'border-orange-400 data-[state=checked]:bg-orange-400'
        case 'Expired':
            return 'border-gray-400 data-[state=checked]:bg-gray-400'
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

const teamColors = [
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
]

export const getTeamBadge = (index?: number) => {
    if (index === undefined || index < 0) {
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-blue-200'
    }
    const colorIndex = index % teamColors.length
    return `inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${teamColors[colorIndex]}`
}

export const getPriorityBadge = (priority: string | number) => {
    const level = typeof priority === 'number' ? {
        1: "high",
        2: "medium",
        3: "low"
    }[Number(priority)] : priority

    switch (level) {
        case "high":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        case "medium":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        case "low":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        case "all":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
        default:
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
}

export const getTaskStatusBadge = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    switch (status.toLowerCase().replace(/\s+/g, "")) {
        case "all":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
        case "todo":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        case "inprogress":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        case "bug":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-red-900 dark:text-red-200"
        case "done":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        case "cancel":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
        case "expired":
            return "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-gray-900 dark:text-gray-200"
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

export const getPriorityIcon = (priority: string | undefined | number) => {
    const level = typeof priority === 'number' ? {
        1: "high",
        2: "medium",
        3: "low"
    }[Number(priority)] : priority

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
        case "bug":
            return "bg-red-100 text-red-700 hover:bg-red-100"
        case "expired":
            return "bg-red-100 text-red-700 hover:bg-red-100"
        default:
            return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    }
}

export const getPriorityLabel = (priority: number) => {
    const labels = { 1: "High", 2: "Medium", 3: "Low" }
    return labels[priority as keyof typeof labels] || `Priority ${priority}`
}

export const formatTaskStatus = (statusKey: string) => {
    const words = statusKey.replace(/([A-Z])/g, ' $1').split(/\s+/).filter(Boolean);
    return words.map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
}

export const getDeadlineStatus = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
        return { label: "Overdue", className: "text-red-600 bg-red-50 dark:bg-red-900/20" }
    } else if (diffDays === 0) {
        return { label: "Today", className: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" }
    } else if (diffDays === 1) {
        return { label: "Tomorrow", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" }
    } else if (diffDays <= 7) {
        return { label: `${diffDays} days`, className: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" }
    } else {
        return { label: `${Math.floor(diffDays / 7)} weeks`, className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" }
    }
}

export const getPriorityBorderColor = (priority: number): string => {
    switch (priority) {
        case 1: return "border-l-red-600"
        case 2: return "border-l-yellow-500"
        case 3: return "border-l-green-500"
        default: return "border-l-slate-300"
    }
}

export const ContactIcon = ({ media }: { media: string }) => {
    switch (media.toLowerCase()) {
        case 'github': return <Github size={18} />
        case 'linkedin': return <Linkedin size={18} />
        case 'facebook': return <Facebook size={18} />
        default: return <LinkIcon size={18} />
    }
}

export const getSubscriptionBadge = (plan: string) => {
    if (!plan) {
        return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
    }

    switch (plan.toLowerCase()) {
        case 'pro':
            return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-blue-800 dark:bg-blue-900 dark:text-blue-200'

        case 'premium':
            return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-300 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'

        default:
            return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-300 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
    }
}

export const getActiveAccount = (isActive: boolean) => {
    console.log(isActive)
    if (!isActive) {
        return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }

    return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-300 text-green-800 dark:bg-green-900 dark:text-green-200'
}
