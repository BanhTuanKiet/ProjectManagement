"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ProjectBasic } from "../../utils/IProject"
import axios from "../../config/axiosConfig"
import { Member } from "@/utils/IUser"
import { useParams } from "next/navigation"
import type { TaskAssignee } from "@/utils/IUser"
import * as signalR from "@microsoft/signalr"
import { useUser } from "./UserContext"

type ProjectContextType = {
    project_name: string
    projectRole: string
    projects: ProjectBasic[]
    setProjects: React.Dispatch<React.SetStateAction<ProjectBasic[]>>
    members: Member[] | undefined
    setMembers: React.Dispatch<React.SetStateAction<Member[] | undefined>>
    availableUsers: Member[]
    setAvailableUsers: React.Dispatch<React.SetStateAction<Member[]>>
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
    const { user } = useUser()
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [projects, setProjects] = useState<ProjectBasic[]>([])
    const [members, setMembers] = useState<Member[]>()
    const [projectRole, setProjectRole] = useState<string>("")
    const { project_name } = useParams<{ project_name: string }>()
    const [availableUsers, setAvailableUsers] = useState<Member[]>([])

    useEffect(() => {
        if (!user) return

        const conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5144/hubs/project", {
                accessTokenFactory: () => user.token
            })
            .withAutomaticReconnect()
            .build()

        setConnection(conn)
    }, [user])


    useEffect(() => {
        if (project_name) {
            if (project_name && !isNaN(Number(project_name))) {
                localStorage.setItem("projectId", JSON.stringify(project_name))
            }
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
        if (!project_name || isNaN(Number(project_name))) {
            setProjectRole("");
        }
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`/projects`)
                setProjects(response.data)
            } catch (error) {
                console.log(error)
                setProjectRole("");
            }
        }
        fetchProjects()
    }, [])

    useEffect(() => {
        if (!project_name || isNaN(Number(project_name))) {
            setMembers([]);
            return;
        }
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`/projects/member/${project_name}`)
                console.log(response.data)
                setMembers(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        if (project_name) fetchMembers()
    }, [project_name])

    useEffect(() => {
        if (!project_name || isNaN(Number(project_name)) || !projectRole) {
            setAvailableUsers([]);
            return;
        }
        const fetchMembers = async () => {
            try {
                const projectId = Number(project_name);
                const response = await axios.get(`/projects/${projectId}/member/by-role`)
                setAvailableUsers(response.data)
                console.log("Available users:", response.data);
            } catch (error) {
                console.log(error)
            }
        }
        fetchMembers();
    }, [project_name, projectRole])

    useEffect(() => {
        if (!connection || !project_name) return

        connection.start().then(async () => {
            console.log("Connected to ProjectHub")

        }).catch(error => console.log(error))

        connection.on("ProjectUpdated", (updatedProject: ProjectBasic) => {
            console.log("ProjectUpdated received:", updatedProject)
            setProjects(prevProjects => {
                const filtered = prevProjects.filter(p => p.projectId !== updatedProject.projectId)
                return [...filtered, updatedProject]
            })
        })

        connection.on("ProjectDeleted", (ids: number) => {
            setProjects(prev => {
                const next = prev.filter(p => p.projectId !== ids)
                return next
            })
        })

        return () => {
            connection.off("ProjectUpdated")
            connection?.off("ProjectDeleted")
            connection?.stop()
        }
    }, [connection, project_name])

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