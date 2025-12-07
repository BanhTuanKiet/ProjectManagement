'use client'

import React, { useEffect, useState } from 'react'
import {
    Mail,
    Calendar,
    MapPin,
    Pencil,
    Trash2,
    Plus,
    Save,
    X,
    ArrowRight,
} from 'lucide-react'
import { Contact, TeamMembers, UserProfile } from '@/utils/IUser'
import axios from '@/config/axiosConfig'
import { formatDate } from '@/utils/dateUtils'
import { ContactIcon, getRoleBadge } from '@/utils/statusUtils'
import ColoredAvatar from '@/components/ColoredAvatar'
import { Media } from '@/utils/IContact'
import HeaderComponent from '@/components/HeaderComponent'
import { useRouter } from 'next/navigation'
import TeamMemberDisplay from '@/components/TeamMemberDisplay'

export default function Page() {
    const [user, setUser] = useState<UserProfile>()
    const [activeTab, setActiveTab] = useState<'projects' | 'team'>('projects')
    const [isEditingContacts, setIsEditingContacts] = useState(false)
    const [tempContacts, setTempContacts] = useState<Contact[]>([])
    const [medias, setMedias] = useState<Media[]>()
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [tempInfo, setTempInfo] = useState({ name: "", location: "" })
    const router = useRouter()

    const [allMember, setAllMember] = useState<TeamMembers[]>([])
    const [searchTeam, setSearchTeam] = useState("")
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");

    useEffect(() => {
        const fetchUses = async () => {
            try {
                if (email) {
                    const response = await axios.get(`/users/profile/${email}`)
                    setUser(response.data)
                    setTempInfo({
                        name: response.data.name,
                        location: response.data.location
                    })
                }
                else {
                    const response = await axios.get(`/users/profile/${"not-email"}`)
                    setUser(response.data)
                    setTempInfo({
                        name: response.data.name,
                        location: response.data.location
                    })
                }

            } catch (error) {
                console.log(error)
            }
        }

        fetchUses()
    }, [])

    useEffect(() => {
        const fetchMember = async () => {
            try {
                if (!email) {
                    const response = await axios.get(`/teams/all-members`)
                    console.log(response.data)
                    setAllMember(response.data)
                }
            } catch (error) {
                console.log(error)
                setAllMember([])
            }
        }
        fetchMember()
    }, [])

    useEffect(() => {
        const fetchMedias = async () => {
            try {
                const response = await axios.get(`/medias`)
                setMedias(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchMedias()
    }, [])

    const startEditingContacts = () => {
        if (!user) return
        setTempContacts(user.contacts.map(c => ({
            ...c,
            mediaId: c.mediaId || crypto.randomUUID()
        })))
        setIsEditingContacts(true)
    }

    const cancelEditingContacts = () => {
        setTempContacts([])
        setIsEditingContacts(false)
    }

    const addContact = () => {
        const newContact: Contact = {
            mediaId: crypto.randomUUID(),
            media: '',
            url: ''
        }

        setTempContacts(prev => [...prev, newContact])
    }

    const updateContact = (id: string, field: keyof Contact, value: string) => {
        setTempContacts(prev =>
            prev.map(c =>
                c.mediaId === id ? { ...c, [field]: value } : c
            )
        )
    }

    const deleteContact = async (id: string) => {
        setTempContacts(prev => prev.filter(c => c.mediaId !== id))
    }

    const saveContacts = async () => {
        if (!user || !medias) return

        try {
            const normalizedContacts = tempContacts
                .map(item => {
                    const mediaObj = medias.find(m => m.name === item.media)

                    return {
                        ...item,
                        mediaId: mediaObj ? mediaObj.id : item.mediaId,
                        media: item.media,
                    }
                })
                .filter(c => c.media.trim() !== '' && c.url.trim() !== '')

            const finalContactsForApi = normalizedContacts.map(({ media, ...rest }) => rest)

            await axios.put(`/medias/contact`, finalContactsForApi)

            setUser(prev => ({
                ...prev!,
                contacts: normalizedContacts
            }))
        } catch (error) {
            console.log(error)
        } finally {
            setIsEditingContacts(false)
        }
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await axios.post(`/users/upload/${"avatar"}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            setUser((prev) => ({
                ...prev!,
                avatar: res.data.imageUrl
            }))

        } catch (error) {
            console.error("Upload failed:", error)
        }
    }

    const updateInfo = (field: "name" | "location", value: string) => {
        setTempInfo(prev => ({ ...prev, [field]: value }))
    }

    const handleInfoChange = async () => {
        try {
            await axios.put("/users/profile", tempInfo)

            setUser(prev => ({
                ...prev!,
                name: tempInfo.name,
                location: tempInfo.location
            }))

            setIsEditingInfo(false)
        } catch (err) {
            console.log(err)
        }
    }

return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans">
        <HeaderComponent />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT SIDEBAR */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-20 mt-20">

                        {/* AVATAR + BASIC INFO */}
                        <div className="p-4 flex flex-col items-center text-center border-b border-gray-100">
                            {user && (
                                <div className="relative group w-fit mx-auto">

                                    <ColoredAvatar
                                        src={user?.avatar}
                                        id={user?.id}
                                        name={user?.name}
                                        size="xxl"
                                    />

                                    {!email && (
                                        <>
                                            <label
                                                htmlFor="avatarUpload"
                                                className="absolute bottom-0 right-0 
                                                w-9 h-9 bg-white shadow-md rounded-full 
                                                flex items-center justify-center cursor-pointer 
                                                border border-gray-200 transition-all 
                                                hover:bg-blue-600 hover:text-white"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-gray-600 group-hover:text-white"
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                        d="M3 7h4l2-3h6l2 3h4v13H3V7z" />
                                                    <circle cx="12" cy="13" r="3" />
                                                </svg>
                                            </label>

                                            <input
                                                id="avatarUpload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* INFO */}
                            <div className="w-full mt-4 text-center">
                                {!isEditingInfo ? (
                                    <>
                                        <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>

                                        <div className="mt-2 flex items-center justify-center text-gray-500 text-sm">
                                            <MapPin size={14} className="mr-1" />
                                            {user?.location}
                                        </div>

                                        {!email && (
                                            <button
                                                onClick={() => setIsEditingInfo(true)}
                                                className="mt-2 text-xs text-blue-600 hover:underline"
                                            >
                                                Edit info
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={tempInfo.name}
                                            onChange={(e) => updateInfo("name", e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                                        />

                                        <input
                                            type="text"
                                            value={tempInfo.location}
                                            onChange={(e) => updateInfo("location", e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                                        />

                                        <div className="flex gap-2 justify-center pt-1">
                                            <button
                                                onClick={handleInfoChange}
                                                className="px-3 py-1 text-xs bg-green-600 text-white rounded"
                                            >
                                                <Save size={12} className="inline mr-1" /> Save
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setTempInfo({
                                                        name: user?.name || "",
                                                        location: user?.location || ""
                                                    })
                                                    setIsEditingInfo(false)
                                                }}
                                                className="px-3 py-1 text-xs bg-gray-300 rounded"
                                            >
                                                <X size={12} className="inline mr-1" /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CONTACTS */}
                        <div className="border-b">
                            <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Contact Information
                                </h3>

                                {!isEditingContacts ? (
                                    <button
                                        onClick={startEditingContacts}
                                        className="text-gray-400 hover:text-blue-600"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                ) : (
                                    <div className="flex gap-1">
                                        <button onClick={saveContacts} className="text-green-600 p-1">
                                            <Save size={16} />
                                        </button>
                                        <button onClick={cancelEditingContacts} className="text-red-600 p-1">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="px-4 py-3">

                                {/* VIEW MODE */}
                                {!isEditingContacts ? (
                                    <ul className="space-y-3">

                                        <li className="flex items-center text-sm text-gray-600">
                                            <Mail size={16} className="mr-3 text-gray-400" />
                                            <a href={`mailto:${user?.email}`} className="hover:text-blue-600 truncate">
                                                {user?.email}
                                            </a>
                                        </li>

                                        {user?.contacts?.length === 0 && (
                                            <li className="text-sm text-gray-400 italic">
                                                No additional contacts
                                            </li>
                                        )}

                                        {user?.contacts?.map(contact => (
                                            <li key={contact.mediaId}
                                                className="flex items-center text-sm group">
                                                <div className="w-8 text-gray-400 group-hover:text-blue-500">
                                                    <ContactIcon media={contact.media} />
                                                </div>

                                                <a
                                                    href={contact.url}
                                                    target="_blank"
                                                    className="truncate flex-1 hover:text-blue-600"
                                                >
                                                    {contact.url}
                                                </a>

                                                <ArrowRight
                                                    size={12}
                                                    className="opacity-0 group-hover:opacity-100"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    /* EDIT MODE */
                                    <div className="space-y-3">
                                        {tempContacts.map(contact => {
                                            const used = tempContacts
                                                .filter(c => c.mediaId !== contact.mediaId)
                                                .map(c => c.media)

                                            const available = medias
                                                ?.filter(m => m.name === contact.media || !used.includes(m.name))

                                            return (
                                                <div key={contact.mediaId}
                                                    className="flex items-center gap-2 bg-gray-50 p-2 rounded border">

                                                    <select
                                                        value={contact.media}
                                                        onChange={(e) => updateContact(contact.mediaId, "media", e.target.value)}
                                                        className="text-xs border rounded p-1 w-24"
                                                    >
                                                        <option value="">Select</option>
                                                        {available?.map(m => (
                                                            <option key={m.id} value={m.name}>{m.name}</option>
                                                        ))}
                                                    </select>

                                                    <input
                                                        type="text"
                                                        value={contact.url}
                                                        onChange={(e) => updateContact(contact.mediaId, "url", e.target.value)}
                                                        className="text-xs border rounded p-1 flex-1"
                                                        placeholder="https://..."
                                                    />

                                                    <button
                                                        onClick={() => deleteContact(contact.mediaId)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )
                                        })}

                                        <button
                                            onClick={addContact}
                                            className="w-full mt-2 py-2 border border-dashed rounded text-xs text-gray-500 hover:text-blue-600"
                                        >
                                            <Plus size={14} /> Add new contact
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SUBSCRIPTION */}
                        <div className="pb-3">
                            <h3 className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
                                Subscription
                            </h3>

                            {user?.subcription ? (() => {
                                const end = new Date(user.subcription.expiredAt).getTime()
                                const expired = Date.now() > end

                                return (
                                    <div className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-yellow-400 text-white flex items-center justify-center">
                                                    ⭐
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {user.subcription.planName}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className={`px-3 py-1 text-xs font-semibold rounded-full ${expired ? "bg-red-600" : "bg-blue-600"} text-white`}>
                                                    {expired ? "Expired" : "Active"}
                                                </div>

                                                <button
                                                    className="px-3 py-1 text-xs rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50"
                                                    onClick={() => router.push("/plan")}
                                                >
                                                    Upgrade
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-3 text-xs text-gray-600">
                                            <p>Start date: {formatDate(user.subcription.startedAt)}</p>
                                            <p>Expired date: {formatDate(user.subcription.expiredAt)}</p>
                                        </div>
                                    </div>
                                )
                            })() : (
                                <div className="p-4 border rounded-lg text-center text-sm text-gray-500">
                                    No subscription
                                    <button
                                        className="w-full mt-3 px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={() => router.push("/plan")}
                                    >
                                        Get a plan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="lg:col-span-8 xl:col-span-9 mt-6 lg:mt-20">

                    {/* TABS */}
                    <div className="border-b border-gray-200 mb-6 bg-white rounded-lg shadow-sm px-4">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("projects")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "projects" ? "border-blue-600 text-blue-600" : "text-gray-500 border-transparent"}`}
                            >
                                Project participation ({user?.projects?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab("team")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "team" ? "border-blue-600 text-blue-600" : "text-gray-500 border-transparent"}`}
                            >
                                Team ({allMember.length})
                            </button>
                        </nav>
                    </div>

                    {/* PROJECT LIST */}
                    {activeTab === "projects" && (
                        <div className="bg-white rounded-xl shadow-lg border">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-800">Projects You are Involved In</h2>

                                <button className="text-sm text-blue-600 hover:underline">View all</button>
                            </div>

                            <div className="divide-y">
                                {user?.projects?.map(project => (
                                    <div key={project.projectId} className="p-6 hover:bg-gray-50 transition-colors group">
                                        <div className="flex justify-between">

                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                                                    {project.name.charAt(0)}
                                                </div>

                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700">
                                                        {project.name}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-gray-500">{project.description}</p>

                                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} className="text-blue-400" />
                                                            <span>
                                                                {formatDate(project.startDate)} - {formatDate(project.endDate)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium">Owner:</span>
                                                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border">
                                                                {project.ownerId === user.id ? "Me" : project.owner}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium">Role:</span>
                                                            <span className={`${getRoleBadge(project.role ?? "Member")} text-xs px-2 py-0.5 rounded-full font-bold`}>
                                                                {project.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {!email && (
                                                <a
                                                    href={`/project/${project.projectId}`}
                                                    className="mt-2 text-xs text-blue-600 flex items-center gap-1 hover:underline"
                                                >
                                                    View project <ArrowRight size={12} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {(!user?.projects || user.projects.length === 0) && (
                                    <div className="p-6 text-center text-gray-500">
                                        You are not currently participating in any projects.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TEAM LIST */}
                    {activeTab === "team" && (
                        <TeamMemberDisplay
                            allMember={allMember}
                            searchTeam={searchTeam}
                            setSearchTeam={setSearchTeam}
                        />
                    )}
                </div>

            </div>
        </main>
    </div>
)
}