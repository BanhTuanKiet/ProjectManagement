"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ProjectBasic } from "../../utils/IProject"
import axios from "../../config/axiosConfig"

type ProjectContextType = {
    projects: ProjectBasic[]
    setProjects: React.Dispatch<React.SetStateAction<ProjectBasic[]>>
}

const ProjectContext = createContext<ProjectContextType>({
    projects: [],
    setProjects: () => { },
})

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [projects, setProjects] = useState<ProjectBasic[]>([])

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

    return (
        <ProjectContext.Provider value={{ projects, setProjects }}>
            {children}
        </ProjectContext.Provider>
    )
}

export const useProject = () => useContext(ProjectContext)
