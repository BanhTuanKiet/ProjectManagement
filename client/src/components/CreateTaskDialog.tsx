"use client";

import { useState } from "react";
import axios from "@/config/axiosConfig";
import { useParams } from 'next/navigation'

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateTaskDialog({ open, onClose }: CreateTaskDialogProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: 1,
    deadline: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const { project_name } = useParams()
  const handleSubmit = async () => {
    try {
      const projectId = project_name
      await axios.post(`/tasks/view/${projectId}`, {
        ...form,
        priority: Number(form.priority),
        deadline: form.deadline ? new Date(form.deadline).toLocaleString('sv-SE').replace(' ', 'T') : null,
      });
      onClose(); 
    } catch (error) {
      console.error(error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
          <input
            name="assigneeId"
            placeholder="Assignee ID"
            value={form.assigneeId}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
          </select>
          <input
            type="datetime-local"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
