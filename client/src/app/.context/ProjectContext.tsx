"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ProjectBasic } from "../../utils/IProject"
import axios from "../../config/axiosConfig"
import { Member } from "@/utils/IUser"
import { useParams } from "next/navigation"

type ProjectContextType = {
    projects: ProjectBasic[]
    setProjects: React.Dispatch<React.SetStateAction<ProjectBasic[]>>
    members: Member[] | undefined
    setMembers: React.Dispatch<React.SetStateAction<Member[] | undefined>>
}

const ProjectContext = createContext<ProjectContextType>({
    projects: [],
    setProjects: () => {},
    members: undefined,
    setMembers: () => {},
})

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [projects, setProjects] = useState<ProjectBasic[]>([])
    const [members, setMembers] = useState<Member[]>()
    const { project_name } = useParams<{ project_name: string }>()

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`/projects`)
                setProjects(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchProjects()
    }, [])

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`/projects/member/${project_name}`)
                setMembers(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        if (project_name) fetchMembers()
    }, [project_name])

    return (
        <ProjectContext.Provider
            value={{
                projects,
                setProjects,
                members,
                setMembers,
            }}
        >
            {children}
        </ProjectContext.Provider>
    )
}

export const useProject = () => useContext(ProjectContext)