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
import TeamMemberDisplay from '@/components/TeamMemberDisplay'

export default function Page() {
    const [user, setUser] = useState<UserProfile>()
    const [activeTab, setActiveTab] = useState<'projects' | 'team'>('projects')
    const [isEditingContacts, setIsEditingContacts] = useState(false)
    const [tempContacts, setTempContacts] = useState<Contact[]>([])
    const [medias, setMedias] = useState<Media[]>()
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [tempInfo, setTempInfo] = useState({ name: "", location: "" })

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
            <div className="h-24 bg-gradient-to-r from-blue-900 to-blue-700 relative" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10 top-20 sticky">
                            <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
                                {user &&
                                    <div className="relative">
                                        <ColoredAvatar src={user?.avatar} id={user?.id} name={user?.name} size='xxl' />
                                        {!email && (
                                            <div className="mt-3 text-center">
                                                <label
                                                    htmlFor="avatarUpload"
                                                    className="cursor-pointer text-sm text-blue-600 hover:underline"
                                                >
                                                    Change avatar
                                                </label>
                                                <input
                                                    id="avatarUpload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleAvatarChange}
                                                />
                                            </div>
                                        )}
                                    </div>
                                }

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
                                                className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter name"
                                            />

                                            <input
                                                type="text"
                                                value={tempInfo.location}
                                                onChange={(e) => updateInfo("location", e.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter location"
                                            />

                                            <div className="flex gap-2 justify-center pt-1">
                                                <button
                                                    onClick={handleInfoChange}
                                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                                                >
                                                    <Save size={12} className='inline mr-1' /> Save
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setTempInfo({
                                                            name: user?.name || "",
                                                            location: user?.location || ""
                                                        })
                                                        setIsEditingInfo(false)
                                                    }}
                                                    className="px-3 py-1 text-xs bg-gray-300 rounded hover:bg-gray-400 transition"
                                                >
                                                    <X size={12} className='inline mr-1' /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            contact information
                                        </h3>

                                        {!isEditingContacts ? (
                                            <button
                                                onClick={startEditingContacts}
                                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Change contact"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={saveContacts}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                    title="Save"
                                                >
                                                    <Save size={14} />
                                                </button>
                                                <button
                                                    onClick={cancelEditingContacts}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!isEditingContacts ? (
                                        <ul className="space-y-3">
                                            <li className="flex items-center text-sm text-gray-600">
                                                <Mail size={16} className="mr-3 text-gray-400" />
                                                <a href={`mailto:${user?.email}`} className="hover:text-blue-600 truncate">
                                                    {user?.email}
                                                </a>
                                            </li>

                                            {user?.contacts?.map(contact => (
                                                <li key={contact.mediaId} className="flex items-center text-sm text-gray-600">
                                                    <div className="mr-3 text-gray-400">
                                                        <ContactIcon media={contact.media} />
                                                    </div>
                                                    <a
                                                        href={contact.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="hover:text-blue-600 capitalize truncate w-full"
                                                    >
                                                        {contact.media === 'website'
                                                            ? contact.url.replace(/^https?:\/\//, '')
                                                            : contact.url}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="space-y-3">

                                            <div className="flex items-center text-sm text-gray-400 mb-2">
                                                <Mail size={16} className="mr-3" />
                                                <span className="truncate">{user?.email}</span>
                                                <span className="ml-auto text-xs italic">(Read only)</span>
                                            </div>

                                            {medias && tempContacts.map(contact => {
                                                const usedMedias = tempContacts
                                                    .filter(c => c.mediaId !== contact.mediaId)
                                                    .map(c => c.media)

                                                const currentMediaObj =
                                                    medias.find(m => m.name === contact.media) ||
                                                    { id: contact.mediaId, name: contact.media }

                                                const availableMedias = medias.filter(
                                                    m => m.name === contact.media || !usedMedias.includes(m.name)
                                                )

                                                return (
                                                    <div key={contact.mediaId} className="flex items-center gap-2 animate-fadeIn">

                                                        <select
                                                            value={contact.media}
                                                            onChange={(e) => updateContact(contact.mediaId, 'media', e.target.value)}
                                                            className="text-xs border border-gray-300 rounded p-1 w-24 focus:ring-blue-500 focus:border-blue-500 capitalize"
                                                        >
                                                            <option value="">Select</option>
                                                            {availableMedias.map(m => (
                                                                <option key={m.id} value={m.name}>{m.name}</option>
                                                            ))}
                                                        </select>

                                                        <input
                                                            type="text"
                                                            value={contact.url}
                                                            onChange={(e) => updateContact(contact.mediaId, 'url', e.target.value)}
                                                            placeholder="https://..."
                                                            className="text-xs border border-gray-300 rounded p-1 flex-1 min-w-0 w-full overflow-hidden text-ellipsis whitespace-nowrap focus:ring-blue-500 focus:border-blue-500"
                                                        />

                                                        <button
                                                            onClick={() => deleteContact(contact.mediaId)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )
                                            })}

                                            <button
                                                onClick={addContact}
                                                className="w-full mt-2 py-1.5 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-1 transition-all"
                                            >
                                                <Plus size={12} /> Add contact
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 xl:col-span-9 mt-6 lg:mt-20">

                        <div className="border-b border-gray-200 mb-6 bg-white rounded-lg shadow-sm px-4">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('projects')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'projects'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Project participation ({user?.projects?.length || 0})
                                </button>
                                <button
                                    onClick={() => setActiveTab('team')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'team'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Team ({allMember.length})
                                </button>
                            </nav>
                        </div>

                        {activeTab === 'projects' && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                                    <h2 className="text-lg font-semibold text-gray-800">Projects You are Involved In</h2>
                                    <button className="text-sm text-blue-600 hover:underline">View all</button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {user?.projects.map((project) => (
                                        <div key={project.projectId} className="p-6 hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="mt-1">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                            {project.name.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                            {project.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                                                            {project.description}
                                                        </p>
                                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar size={14} className='text-blue-400' />
                                                                <span className='font-medium'>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className='font-medium'>Owner:</span>
                                                                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                                                                    {project?.ownerId === user.id ? "Me" : project.owner}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className='font-medium'>Role:</span>
                                                                <span className={`${getRoleBadge(project?.role ?? "member")} font-bold text-xs px-2 py-0.5 rounded-full`}>
                                                                    {project.role ?? "Member"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!email && (
                                                    <a
                                                        href={`http://localhost:3000/project/${project.projectId}`}
                                                        className="mt-2 inline-flex items-center text-xs text-blue-600 font-medium hover:underline hover:text-blue-700"
                                                    >
                                                        View project <ArrowRight className="ml-1 h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {!user?.projects?.length && (
                                        <div className="p-6 text-center text-gray-500">
                                            You are not currently participating in any projects.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'team' && (
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