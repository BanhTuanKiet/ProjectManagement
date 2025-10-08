import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, Users, Calendar } from "lucide-react"
import type { ProjectBasic } from "@/utils/IProject"

export function ProjectCard({ project }: { project: ProjectBasic }) {
  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
  }

  return (
    <Card className="w-full max-w-[320px] relative overflow-hidden hover:shadow-md transition-shadow">
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-cyan-200" />

      <CardHeader className="pl-5 pr-4 pt-3 pb-2 space-y-1">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">{project.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{project.name}</h3>
            <p className="text-xs text-gray-600 line-clamp-1">{project.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pl-5 pr-4 pb-3 space-y-2">
        <h4 className="text-xs font-semibold text-gray-700">Quick links</h4>

        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-between h-8 px-2 text-xs font-normal hover:bg-gray-50">
            <span className="text-gray-700 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Owner: {project.owner}
            </span>
          </Button>

          <Button variant="ghost" className="w-full justify-between h-8 px-2 text-xs font-normal hover:bg-gray-50">
            <span className="text-gray-700">Team members</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{project.countMembers}</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-between h-7 px-2 text-xs font-normal text-gray-600 hover:bg-gray-50 mt-2"
        >
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
