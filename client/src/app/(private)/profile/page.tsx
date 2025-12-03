'use client'

import React, { useEffect, useState } from 'react'
import {
    Mail,
    Calendar,
    MapPin,
    Pencil,
    Plus,
    Save,
    X,
    Globe,
    Briefcase,
    Camera,
    Settings,
    ChevronDown,
    SquareArrowOutUpRight,
    ArrowRight,
} from 'lucide-react'

import { Contact, UserProfile } from '@/utils/IUser'
import axios from '@/config/axiosConfig'
import { formatDate } from '@/utils/dateUtils'
import { ContactIcon, getRoleBadge } from '@/utils/statusUtils'
import ColoredAvatar from '@/components/ColoredAvatar'
import { Media } from '@/utils/IContact'
import { useRouter } from 'next/navigation'
import { useHash } from '@/hooks/useHash'

export default function Page() {
    const [user, setUser] = useState<UserProfile>()
    const [isEditingContacts, setIsEditingContacts] = useState(false)
    const [tempContacts, setTempContacts] = useState<Contact[]>([])
    const [medias, setMedias] = useState<Media[]>()
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [tempInfo, setTempInfo] = useState({ name: "", location: "" })
    const { hash, setHash } = useHash()
    const router = useRouter()

    useEffect(() => {
        const fetchUses = async () => {
            try {
                const response = await axios.get(`/users/profile`)
                setUser(response.data)
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
        if (!file) return
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
        setTempContacts(user.contacts?.map(c => ({
            ...c,
            mediaId: c.mediaId || crypto.randomUUID(),
            media: c.media || medias?.find(m => m.id === c.mediaId)?.name || '',
        })) ?? [])
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24 transition-colors duration-200">
            <div className="bg-white shadow-md border border-gray-100 mb-8 overflow-hidden group/profile transition-transform hover:-translate-y-0.5">
                <div className="max-w-7xl mx-auto px-6 pb-6">
                    <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6">
                        <div className="relative flex-shrink-0 mx-auto md:mx-0 z-20">
                            <div className="rounded-full p-1 bg-white shadow-lg ring-1 ring-white">
                                <ColoredAvatar src={user?.avatar} id={user?.id ?? ""} name={user?.name} size='xxl' />
                            </div>

                            <label
                                htmlFor="avatarUpload"
                                className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 p-2 bg-white text-gray-600 rounded-full shadow-md cursor-pointer hover:text-blue-600 hover:scale-105 transition-transform"
                                title="Change avatar"
                            >
                                <Camera size={14} />
                                <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        </div>

                        <div className="flex-1 w-full mt-3 md:mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-5 md:gap-x-6">
                                <div className="md:col-span-2 text-center md:text-left min-h-[70px] flex flex-col justify-end">
                                    {!isEditingInfo ? (
                                        <div className="relative pr-8">
                                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                                                {user?.name || '—'}
                                            </h1>
                                            <div className="flex items-center justify-center md:justify-start text-gray-400 mt-2 text-sm">
                                                <MapPin size={14} className="mr-2 text-gray-300" />
                                                <span className="text-sm">{user?.location || "Add location"}</span>
                                            </div>
                                            <div className="absolute top-0 right-0 md:left-full md:ml-4 md:static md:opacity-0 md:group-hover/profile:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setIsEditingInfo(true)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full"
                                                    title="Edit profile info"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col w-full animate-fadeIn">
                                            <input
                                                type="text"
                                                value={tempInfo.name}
                                                onChange={(e) => updateInfo("name", e.target.value)}
                                                className="text-3xl md:text-4xl font-extrabold text-gray-900 bg-transparent border-b-2 border-blue-200 focus:border-blue-500 focus:outline-none px-0 py-1 leading-tight w-full md:w-auto placeholder-gray-300"
                                                placeholder="Your Name"
                                                autoFocus
                                            />
                                            <div className="flex flex-col md:flex-row items-center gap-3 mt-3">
                                                <div className="relative flex items-center w-full md:w-auto">
                                                    <MapPin size={14} className="absolute left-0 text-blue-500" />
                                                    <input
                                                        type="text"
                                                        value={tempInfo.location}
                                                        onChange={(e) => updateInfo("location", e.target.value)}
                                                        className="pl-5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:outline-none py-1 w-full md:min-w-[240px]"
                                                        placeholder="City, Country"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 md:mt-0">
                                                    <button onClick={handleInfoChange} className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 shadow-sm transition-all">
                                                        Save
                                                    </button>
                                                    <button onClick={() => { setIsEditingInfo(false); setTempInfo({ name: user?.name ?? "", location: user?.location ?? "" }) }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-3 mt-5 md:mt-0 pt-4 md:pt-0 border-t border-gray-100 md:border-t-0 md:border-l md:pl-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Social & Links</span>
                                            <span className="text-xs text-gray-400">— connect your profiles</span>
                                        </div>

                                        {!isEditingContacts && (
                                            <button onClick={startEditingContacts} className="text-gray-400 hover:text-blue-600 p-2 rounded-md transition-colors" title="Edit contacts">
                                                <Settings size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {!isEditingContacts ? (
                                        <div className="flex flex-wrap gap-2 md:justify-start justify-center">
                                            <a href={`mailto:${user?.email}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-all text-sm font-medium shadow-sm">
                                                <Mail size={14} /> <span className="truncate max-w-[180px]">{user?.email}</span>
                                            </a>

                                            {user?.contacts?.map(contact => (
                                                <a
                                                    key={contact.mediaId}
                                                    href={contact.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-transparent hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all text-sm font-medium shadow-sm group"
                                                >
                                                    <ContactIcon media={contact.media} />
                                                    <span className="capitalize truncate">{contact.media}</span>
                                                    <SquareArrowOutUpRight size={12} className="opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all text-blue-400" />
                                                </a>
                                            ))}
                                            {(!user?.contacts?.length) && <span className="text-xs text-gray-400 italic">No links added.</span>}
                                        </div>
                                    ) : (
                                        <div className="animate-fadeIn w-full">
                                            <div className="grid grid-cols-1 gap-y-3">
                                                {tempContacts.map(contact => (
                                                    <div key={contact.mediaId} className="group flex items-center gap-3 py-2 px-3 border border-gray-100 rounded-lg hover:shadow-sm transition-all">
                                                        <div className="relative min-w-[120px]">
                                                            <select
                                                                value={contact.media}
                                                                onChange={(e) => updateContact(contact.mediaId, 'media', e.target.value)}
                                                                className="w-full appearance-none bg-transparent py-2 pr-8 text-sm font-semibold uppercase text-gray-600 focus:text-blue-600 focus:outline-none cursor-pointer"
                                                            >
                                                                <option value="">Select type</option>
                                                                {medias?.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                                            </select>
                                                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                                        </div>

                                                        <input
                                                            value={contact.url}
                                                            onChange={(e) => updateContact(contact.mediaId, 'url', e.target.value)}
                                                            placeholder="https://example.com/username"
                                                            className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 px-0 py-2"
                                                        />

                                                        <button onClick={() => deleteContact(contact.mediaId)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}

                                                <button onClick={addContact} className="flex items-center gap-2 py-2 px-3 text-sm font-semibold text-blue-600 hover:text-blue-700 rounded-md transition-colors w-fit">
                                                    <Plus size={16} /> Add Link
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-dashed border-gray-100">
                                                <button onClick={saveContacts} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm transition-all">
                                                    <Save size={14} /> Save
                                                </button>
                                                <button onClick={cancelEditingContacts} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setHash('')}
                        className={`cursor-pointer pb-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${hash === '' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <Briefcase size={18} />
                        Projects
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${hash === '' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            {user?.projects?.length ?? 0}
                        </span>
                    </button>

                    <button
                        onClick={() => setHash('activity')}
                        className={`cursor-pointer pb-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${hash === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <Globe size={18} />
                        Activity
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {hash === '' && (
                        <>
                            {user?.projects.map((project) => (
                                <div key={project.projectId} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-500 transition-all group flex flex-col h-full">
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
                                            <div className='cursor-pointer flex hover:text-blue-500 hover:font-bold transition-all' onClick={() => router.push(`http://localhost:3000/project/${project.projectId}`)}>
                                                <span className='me-1'>View project</span>
                                                <ArrowRight className='my-auto' size={14} />
                                            </div>
                                        </div>
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

                    {hash === 'activity' && (
                        <div className="col-span-1 md:col-span-3 bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-gray-900 font-medium text-lg">No recent activity</h3>
                            <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">Activities such as task updates, comments, and project changes will appear here once available.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}