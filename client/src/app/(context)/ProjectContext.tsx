"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ProjectBasic } from "../../utils/IProject"
import axios from "../../config/axiosConfig"
import { Member } from "@/utils/IUser"
import { useParams } from "next/navigation"
import type { TaskAssignee } from "@/utils/IUser"

type ProjectContextType = {
    project_name: string
    projectRole: string
    projects: ProjectBasic[]
    setProjects: React.Dispatch<React.SetStateAction<ProjectBasic[]>>
    members: Member[] | undefined
    setMembers: React.Dispatch<React.SetStateAction<Member[] | undefined>>
    availableUsers: TaskAssignee[]
    setAvailableUsers: React.Dispatch<React.SetStateAction<TaskAssignee[]>>
}

const ProjectContext = createContext<ProjectContextType>({
    project_name: "",
    projectRole: "",
    projects: [],
    setProjects: () => { },
    members: undefined,
    setMembers: () => { },
    availableUsers: [],
    setAvailableUsers: () => { },
})

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [projects, setProjects] = useState<ProjectBasic[]>([])
    const [members, setMembers] = useState<Member[]>()
    const [projectRole, setProjectRole] = useState<string>("")
    const { project_name } = useParams<{ project_name: string }>()
    const [availableUsers, setAvailableUsers] = useState<TaskAssignee[]>([])

    useEffect(() => {
        if (project_name) {
            localStorage.setItem("projectId", JSON.stringify(project_name))
        }
    }, [project_name])

    useEffect(() => {
        if (!project_name) return
        const fetchProjectRole = async () => {
            try {
                const reponse = await axios.get(`/users/role/${project_name}`)
                setProjectRole(reponse.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchProjectRole()
    }, [project_name])

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

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const projectId = Number(project_name);
                const response = await axios.get(`/projects/${projectId}/member/by-role`)
                console.log("Fetched members for role:", projectRole, response.data)
                setAvailableUsers(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchMembers();
    }, [project_name, projectRole])

    return (
        <ProjectContext.Provider
            value={{
                project_name,
                projectRole,
                projects,
                setProjects,
                members,
                setMembers,
                availableUsers,
                setAvailableUsers,
            }}
        >
            {children}
        </ProjectContext.Provider>
    )
}

export const useProject = () => useContext(ProjectContext)