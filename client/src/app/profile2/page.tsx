'use client'

import axios from "@/config/axiosConfig";
import React, { useEffect, useState } from "react";
import {
    Camera, Briefcase, Users, MapPin, Mail, Plus, ExternalLink,
    CircleUserRoundIcon, Phone, Facebook, Instagram, Building
} from "lucide-react";
import { BasicTask } from "@/utils/ITask";
import { ProjectBasic } from "@/utils/IProject";
import { UserProfile } from "@/utils/IUser";

const ProfilePage2 = () => {
    const [tasks, setTasks] = useState<BasicTask[]>([]);
    const [projects, setProjects] = useState<ProjectBasic[]>([]);
    const [user, setUser] = useState<UserProfile>({
        userName: "",
        email: "",
        phoneNumber: "",
        jobTitle: "",
        department: "",
        organization: "",
        location: "",
        facebook: "",
        instagram: "",
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [taskRes, projectRes, userRes] = await Promise.all([
                    axios.get("/tasks/user"),
                    axios.get("/projects"),
                    axios.get("/users/profile")
                ]);
                setTasks(taskRes.data);
                setProjects(projectRes.data);
                setUser(userRes.data);
            } catch (error) {
                console.error("Lỗi khi load dữ liệu:", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put("/users/editProfile", user);
            setIsEditing(false);
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
        }
    };


    return (

        <div className="max-w-6xl mx-auto bg-white min-h-screen">
            {/* Header Cover */}
            <div className="relative h-80 bg-gray-400 rounded-t-lg">
                <button className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/20 text-white rounded-md hover:bg-black/30 transition-colors">
                    <Camera size={16} />
                    Add cover image
                </button>
            </div>

            <div className="flex gap-8 px-6 pb-6">
                {/* Left Sidebar */}
                <div className="w-80 -mt-16 relative">
                    <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-lg bg-gray-200 relative">
                        <CircleUserRoundIcon className="w-32 h-32 text-zinc-500 absolute top-0 left-0" />
                    </div>

                    <h1 className="text-2xl font-semibold text-gray-900 mb-4">{user.userName}</h1>

                    <button
                        className="text-blue-600 hover:text-blue-700 text-sm mb-8"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "Cancel editing" : "Manage your account"}
                    </button>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="userName"
                                value={user.userName}
                                onChange={handleChange}
                                placeholder="User Name"
                                className="border rounded w-full p-2" />

                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="border rounded w-full p-2" />

                            <input
                                type="text"
                                name="phoneNumber"
                                value={user.phoneNumber}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                className="border rounded w-full p-2" />

                            <input
                                type="text"
                                name="jobTitle"
                                value={user.jobTitle}
                                onChange={handleChange}
                                placeholder="Job Title"
                                className="border rounded w-full p-2" />

                            <input
                                type="text"
                                name="department"
                                value={user.department}
                                onChange={handleChange}
                                placeholder="Department"
                                className="border rounded w-full p-2" />

                            <input
                                type="text"
                                name="organization"
                                value={user.organization}
                                onChange={handleChange}
                                placeholder="Organization"
                                className="border rounded w-full p-2" />

                            <input
                                type="text"
                                name="location"
                                value={user.location}
                                onChange={handleChange}
                                placeholder="Location"
                                className="border rounded w-full p-2" />

                            <input
                                type="text"
                                name="facebook"
                                value={user.facebook}
                                onChange={handleChange}
                                placeholder="Facebook"
                                className="border rounded w-full p-2" />

                            <input
                                type="text"
                                name="instagram"
                                value={user.instagram}
                                onChange={handleChange}
                                placeholder="Instagram"
                                className="border rounded w-full p-2" />

                            <button type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Save changes
                            </button>
                        </form>
                    ) : (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                                <div className="space-y-3 text-sm text-gray-700">
                                    <p><Briefcase size={16} className="inline mr-2 text-amber-900" /> {user.jobTitle || "Your job title"}</p>
                                    <p><Users size={16} className="inline mr-2 text-emerald-600" /> {user.department || "Your department"}</p>
                                    <p><Building size={16} className="inline mr-2 text-gray-500" /> {user.organization || "Your organization"}</p>
                                    <p><MapPin size={16} className="inline mr-2 text-red-700" /> {user.location || "Your location"}</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
                                <div className="text-sm text-gray-700 space-y-2">
                                    <p><Mail size={16} className="inline mr-2 text-red-500" /> {user.email || "Your email"}</p>
                                    <p><Phone size={16} className="inline mr-2 text-green-600" /> {user.phoneNumber || "Your phone number"}</p>
                                    <p><a href={user.facebook} target="_blank"><Facebook size={16} className="inline mr-2 text-blue-600" /> {user.facebook || "Your Facebook"}</a></p>
                                    <p><a href={user.instagram} target="_blank"><Instagram size={16} className="inline mr-2 text-pink-500" /> {user.instagram || "Your Instagram"}</a></p>
                                </div>

                                {/* Teams Section */}
                                <div className="mb-8 mt-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Teams</h2>
                                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm">
                                        <Plus size={16} />
                                        Create a team
                                    </button>
                                </div>

                                <button className="text-blue-600 hover:text-blue-700 text-sm">
                                    View privacy policy
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 pt-8">
                    {/* Worked On Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Worked on</h2>
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div key={task.taskId} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md">
                                    <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                                    <div>
                                        <div className="font-medium text-gray-900">{task.title}</div>
                                        <div className="text-sm text-gray-600">Task • {task.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Places You Work In Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Places you work in</h2>
                        <div className="space-y-3">
                            {projects.map((p) => (
                                <div
                                    key={p.projectId}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 shadow-sm"
                                >
                                    {/* Left section: Logo + Info */}
                                    <div className="flex items-center gap-4">
                                        {/* Logo box */}
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600 text-sm uppercase">
                                            {p.name?.[0] || "P"}
                                        </div>

                                        {/* Text info */}
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-800">{p.name}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-1 max-w-[280px]">
                                                {p.description || "No description available"}
                                            </p>
                                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                                <span>🗓 Start: {p.startDate?.split("T")[0] || "-"}</span>
                                                <span>⏳ End: {p.endDate?.split("T")[0] || "-"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* External link */}
                                    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                                        <ExternalLink size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage2;