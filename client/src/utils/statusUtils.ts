export const taskStatus = [
  { id: 1, name: 'Todo', color: '#6B7280' },      // gray
  { id: 2, name: 'In Progress', color: '#F59E0B' }, // yellow
  { id: 3, name: 'Done', color: '#10B981' },       // green
  { id: 4, name: 'Cancel', color: '#9CA3AF' },     // gray-400
  { id: 5, name: 'Expired', color: '#EF4444' },    // red
]

export const getBorderColor = (status: string) => {
  switch (status) {
    case 'Todo':
      return 'border border-gray-500'
    case 'In Progress':
      return 'border border-yellow-500'
    case 'Done':
      return 'border border-green-500'
    case 'Cancel':
      return 'border border-gray-400'
    case 'Expired':
      return 'border border-red-500'
    default:
      return 'border border-slate-300'
  }
}

export const getCheckboxColor = (status: string) => {
  switch (status) {
    case 'Todo':
      return 'border-gray-500 data-[state=checked]:bg-gray-500'
    case 'In Progress':
      return 'border-yellow-500 data-[state=checked]:bg-yellow-500'
    case 'Done':
      return 'border-green-500 data-[state=checked]:bg-green-500'
    case 'Cancel':
      return 'border-gray-400 data-[state=checked]:bg-gray-400'
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
    default: 
      return 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:slate-blue-200'
  }
}