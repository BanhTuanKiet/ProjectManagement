export const taskStatus = [
  { id: 1, name: 'Todo', color: '#6B7280' },
  { id: 2, name: 'In Progress', color: '#F59E0B' },
  { id: 3, name: 'Done', color: '#10B981' },
  { id: 4, name: 'Cancel', color: '#EF4444' },
  { id: 5, name: 'Expired', color: '#8B5CF6' },
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
      return 'border border-red-500'
    case 'Expired':
      return 'border border-purple-500'
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
      return 'border-red-500 data-[state=checked]:bg-red-500'
    case 'Expired':
      return 'border-purple-500 data-[state=checked]:bg-purple-500'
    default:
      return 'border-slate-400 data-[state=checked]:bg-slate-400'
  }
}

