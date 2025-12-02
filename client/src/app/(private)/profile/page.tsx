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
    Globe,
    Briefcase,
    Camera,
    Settings,
    ArrowUpRight,
    ChevronDown,
} from 'lucide-react'

import { Contact, UserProfile } from '@/utils/IUser'
import axios from '@/config/axiosConfig'
import { formatDate } from '@/utils/dateUtils'
import { ContactIcon, getRoleBadge } from '@/utils/statusUtils'
import ColoredAvatar from '@/components/ColoredAvatar'
import { Media } from '@/utils/IContact'

const SUBSCRIPTION = {
    planId: 'pro_monthly_123',
    planName: 'Pro Monthly',
    status: 'Active',
    renewalDate: '2026-01-01',
}

export default function Page() {
    const [user, setUser] = useState<UserProfile>()
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'activity'>('projects')
    const [isEditingContacts, setIsEditingContacts] = useState(false)
    const [tempContacts, setTempContacts] = useState<Contact[]>([])
    const [medias, setMedias] = useState<Media[]>()
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [tempInfo, setTempInfo] = useState({ name: "", location: "" })

    useEffect(() => {
        const fetchUses = async () => {
            try {
                const response = await axios.get(`/users/profile`)
                setUser(response.data)
                console.log(response.data)
                setTempInfo({
                    name: response.data.name,
                    location: response.data.location
                })
            } catch (error) {
                console.log(error)
            }
        }
        fetchUses()
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

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return;
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await axios.post(`/users/upload/${"avatar"}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            setUser((prev) => ({ ...prev!, avatar: res.data.imageUrl }))
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

    const startEditingContacts = () => {
        if (!user) return
        setTempContacts(user.contacts.map(c => ({
            ...c,
            mediaId: c.mediaId || crypto.randomUUID(),
            media: c.media || medias?.find(m => m.id === c.mediaId)?.name || '',
        })))
        setIsEditingContacts(true)
    }

    const cancelEditingContacts = () => {
        setTempContacts([])
        setIsEditingContacts(false)
    }

    const addContact = () => {
        setTempContacts(prev => [...prev, { mediaId: crypto.randomUUID(), media: '', url: '' }])
    }

    const updateContact = (id: string, field: keyof Contact, value: string) => {
        setTempContacts(prev => prev.map(c => c.mediaId === id ? { ...c, [field]: value } : c))
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
                    return { ...item, mediaId: mediaObj ? mediaObj.id : item.mediaId }
                })
                .filter(c => c.media.trim() !== '' && c.url.trim() !== '')

            const finalContacts = normalizedContacts.map(({ media, ...rest }) => rest)
            setUser(prev => ({ ...prev!, contacts: normalizedContacts }))
            await axios.put(`/medias/contact`, finalContacts)
        } catch (error) {
            console.log(error)
        } finally {
            setIsEditingContacts(false)
        }
    }
console.log(user)
    return (
        <div className="min-h-screen bg-gray-50/50 font-sans pb-20">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 w-full"></div>

                <div className="max-w-7xl mx-auto px-6 pb-6">
                    <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-12 md:gap-6">
                        <div className="relative flex-shrink-0 group mx-auto md:mx-0">
                            <div className="rounded-full p-1 bg-white shadow-md">
                                <ColoredAvatar src={user?.avatar} id={user?.id ?? ""} name={user?.name} size='xxl'/>
                            </div>

                            <label
                                htmlFor="avatarUpload"
                                className="absolute bottom-2 right-2 p-2 bg-white text-gray-600 rounded-full shadow-lg cursor-pointer hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100"
                                title="Change Avatar"
                            >
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <Camera size={16} />
                                </div>
                                <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        </div>

                        <div className="flex-1 w-full mt-4 md:mt-0 text-center md:text-left md:pb-1">
                            {!isEditingInfo ? (
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                                {user?.name}
                                            </h1>
                                            <div className="flex items-center justify-center md:justify-start text-gray-500 mt-1 text-sm font-medium">
                                                <MapPin size={14} className="mr-1 text-gray-400" />
                                                {user?.location || "Location not updated"}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setIsEditingInfo(true)}
                                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all shadow-sm"
                                        >
                                            <Pencil size={14} /> Edit Profile
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 animate-fadeIn mt-2 md:mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Display Name</label>
                                            <input
                                                type="text"
                                                value={tempInfo.name}
                                                onChange={(e) => updateInfo("name", e.target.value)}
                                                className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Location</label>
                                            <input
                                                type="text"
                                                value={tempInfo.location}
                                                onChange={(e) => updateInfo("location", e.target.value)}
                                                className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4 justify-end">
                                        <button onClick={() => setIsEditingInfo(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
                                        <button onClick={handleInfoChange} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors">Save Profile</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-full md:hidden mt-4 flex justify-center">
                            <button
                                onClick={() => setIsEditingInfo(true)}
                                className="w-full max-w-xs flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm"
                            >
                                <Pencil size={14} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 md:ml-[168px] pt-4 border-t md:border-t-0 border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Connect</span>
                            {!isEditingContacts && (
                                <button onClick={startEditingContacts} className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-all" title="Edit Contacts">
                                    <Settings size={14} />
                                </button>
                            )}
                        </div>

                        {!isEditingContacts ? (
                            <div className="flex flex-wrap gap-2 md:justify-start justify-center">
                                <a href={`mailto:${user?.email}`} className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all text-sm">
                                    <Mail size={14} className="text-gray-400 group-hover:text-blue-500" />
                                    <span className="truncate max-w-[200px]">{user?.email}</span>
                                </a>

                                {user?.contacts?.map(contact => (
                                    <a
                                        key={contact.mediaId}
                                        href={contact.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm transition-all text-sm"
                                    >
                                        <ContactIcon media={contact.media} />
                                        <span className="capitalize font-medium">{contact.media}</span>
                                        <ArrowUpRight size={12} className="text-gray-300 group-hover:text-blue-500" />
                                    </a>
                                ))}

                                {(!user?.contacts?.length) && <span className="text-sm text-gray-400 italic px-2">No social links added.</span>}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-4 border border-blue-100 shadow-inner animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {tempContacts.map(contact => {
                                        const usedMedias = tempContacts.filter(c => c.mediaId !== contact.mediaId).map(c => c.media);
                                        const sortedMedias = [
                                            medias?.find(m => m.name === contact.media) || { id: contact.mediaId, name: contact.media },
                                            ...medias?.filter(m => m.name !== contact.media && !usedMedias.includes(m.name)) ?? []
                                        ]

                                        return (
                                            <div key={contact.mediaId} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                                                <div className="relative">
                                                    <select
                                                        value={contact.media}
                                                        onChange={(e) => updateContact(contact.mediaId, 'media', e.target.value)}
                                                        className="appearance-none bg-transparent pl-2 pr-6 py-1 text-xs font-bold uppercase text-gray-600 focus:outline-none cursor-pointer w-20"
                                                    >
                                                        <option value="">Type</option>
                                                        {sortedMedias.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                                                        <ChevronDown size={10} />
                                                    </div>
                                                </div>
                                                <div className="w-px h-4 bg-gray-300"></div>
                                                <input
                                                    value={contact.url}
                                                    onChange={(e) => updateContact(contact.mediaId, 'url', e.target.value)}
                                                    placeholder="Paste URL..."
                                                    className="flex-1 text-xs border-none focus:ring-0 p-0 text-gray-700 placeholder-gray-400"
                                                />
                                                <button onClick={() => deleteContact(contact.mediaId)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )
                                    })}

                                    <button onClick={addContact} className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs font-medium h-[42px]">
                                        <Plus size={14} /> Add New Link
                                    </button>
                                </div>

                                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-200/60">
                                    <button onClick={cancelEditingContacts} className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50">Cancel</button>
                                    <button onClick={saveContacts} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm">
                                        <Save size={12} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`pb-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'projects' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <Briefcase size={18} />
                        Projects
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'projects' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            {user?.projects?.length || 0}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`pb-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <Globe size={18} />
                        Activity
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeTab === 'projects' && (
                        <>
                            {user?.projects.map((project) => (
                                <div key={project.projectId} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                            {project.name.charAt(0)}
                                        </div>
                                        <div className={`${getRoleBadge(project?.role ?? "member")} px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider border`}>
                                            {project.role ?? "Member"}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1" title={project.name}>
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                                        {project.description}
                                    </p>

                                    <div className="border-t border-gray-50 pt-4 mt-auto">
                                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                                            <div className="flex items-center">
                                                <Calendar size={12} className="mr-1.5" />
                                                {formatDate(project.startDate)}
                                            </div>
                                            {project.ownerId === user.id && <span className="text-indigo-500 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">Owner</span>}
                                        </div>
                                        <a href={`http://localhost:3000/project/${project.projectId}`} className="w-full block text-center py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded hover:bg-blue-600 hover:text-white transition-all">
                                            View Project
                                        </a>
                                    </div>
                                </div>
                            ))}

                            <button className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[250px] hover:border-blue-400 hover:bg-blue-50 transition-all group cursor-pointer">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <Plus size={24} className="text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium group-hover:text-blue-600">Create Project</p>
                            </button>
                        </>
                    )}

                    {activeTab === 'activity' && (
                        <div className="col-span-1 md:col-span-3 bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-gray-900 font-medium text-lg">No recent activity</h3>
                            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">Activities such as task updates, comments, and project changes will appear here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}