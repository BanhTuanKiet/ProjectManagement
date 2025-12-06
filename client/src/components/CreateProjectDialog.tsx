"use client";

import React, { useState } from "react";
import axios from "@/config/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/app/(context)/ProjectContext";
import { X, FolderPlus, Calendar, Check, Loader2, Info } from "lucide-react"; // Import các icon cần thiết

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// Hàm tiện ích để áp dụng các class Tailwind tùy chỉnh
const cn = (...classes: (string | boolean | undefined | null)[]): string => {
    return classes.filter(Boolean).join(' ');
};

export default function CreateProjectDialog({
    open,
    onClose,
    onSuccess,
}: CreateProjectDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        createdBy: "", // Giả sử user ID sẽ được điền tự động từ context hoặc token
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { setProjects } = useProject();

    // --- Date Utilities ---
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getMinDueDate = (startDate: string) => {
        if (!startDate) return getTodayDate();
        
        const start = new Date(startDate);
        // Tăng thêm 1 ngày so với ngày bắt đầu (hoặc ít nhất là hôm nay)
        start.setDate(start.getDate() + 1); 
        
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, '0');
        const day = String(start.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };
    // ----------------------

    const minStart = getTodayDate();
    const minDue = getMinDueDate(formData.startDate);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        // Client-side validation
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError("End Date must be after Start Date.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("projects/createProject", formData);
            
            // Cập nhật danh sách projects trong context (giả định API trả về danh sách mới)
            setProjects(response.data.data);
            
            onSuccess?.();
            
            // Đặt lại form về trạng thái ban đầu sau khi thành công
            setFormData({
                name: "",
                description: "",
                startDate: "",
                endDate: "",
                createdBy: "",
            });
            onClose();
        } catch (error) {
            console.error("Error creating project:", error);
            setError("Failed to create project. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose} 
                >
                    <motion.div
                        initial={{ scale: 0.95, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-xl shadow-2xl border border-gray-100 dark:border-neutral-800"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <FolderPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                    Create New Project
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            <div>
                                <label 
                                    htmlFor="name" 
                                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Website Redesign Phase 1"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white transition-all"
                                />
                            </div>

                            <div>
                                <label 
                                    htmlFor="description" 
                                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Briefly describe the goals and scope of the project."
                                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label 
                                        htmlFor="startDate" 
                                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        <Calendar className="inline h-4 w-4 mr-1 text-gray-500" /> Start Date
                                    </label>
                                    <input
                                        id="startDate"
                                        type="date"
                                        name="startDate"
                                        required
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        min={minStart}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label 
                                        htmlFor="endDate" 
                                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        <Calendar className="inline h-4 w-4 mr-1 text-gray-500" /> End Date
                                    </label>
                                    <input
                                        id="endDate"
                                        type="date"
                                        name="endDate"
                                        required
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        min={minDue}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white transition-all"
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
                                    >
                                        <Info className="h-4 w-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.name || !formData.startDate || !formData.endDate}
                                    className={cn(
                                        "px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
                                        "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30",
                                        "disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed dark:disabled:bg-neutral-700"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-5 w-5" />
                                            Create Project
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}