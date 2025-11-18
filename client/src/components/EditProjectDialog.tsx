"use client";

import { useEffect, useState } from "react";
import axios from "@/config/axiosConfig";
import { Calendar, FileText, Type, Save, XCircle, Loader2 } from "lucide-react";
import type { ProjectBasic, UpdateProject } from "@/utils/IProject";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

export default function EditProjectDialog({
  open,
  onOpenChange,
  projectId,
}: EditProjectDialogProps) {
  const [project, setProject] = useState<ProjectBasic | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editMode, setEditMode] = useState({
    title: false,
    description: false,
    startDate: false,
    endDate: false,
  });

  const [formData, setFormData] = useState<UpdateProject>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!open || !projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/projects/getProjectBasic/${projectId}`);
        const data = res.data;
        setProject(data);
        setFormData({
          title: data.name ?? "",
          description: data.description ?? "",
          startDate: data.startDate ?? "",
          endDate: data.endDate ?? "",
        });
      } catch (err) {
        console.error(err);
        alert("Lỗi tải thông tin dự án!");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [open, projectId]);

  const handleSave = async () => {
    if (!project) return;

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
      return;
    }

    if (
      formData.title === project.name &&
      formData.description === project.description &&
      formData.startDate === project.startDate &&
      formData.endDate === project.endDate
    ) {
      onOpenChange(false);
      return;
    }

    const body: UpdateProject = {};
    if (formData.title !== project.name) body.title = formData.title?.trim();
    if (formData.description !== project.description)
      body.description = formData.description?.trim();
    if (formData.startDate !== project.startDate)
      body.startDate = formData.startDate;
    if (formData.endDate !== project.endDate)
      body.endDate = formData.endDate;

    try {
      setSaving(true);
      const res = await axios.put(`/projects/updateProject/${projectId}`, body);
      console.log(res)

      setProject((prev) =>
        prev
          ? {
            ...prev,
            ...(body.title && { name: body.title }),
            ...(body.description && { description: body.description }),
            ...(body.startDate && { startDate: body.startDate }),
            ...(body.endDate && { endDate: body.endDate }),
          }
          : prev
      );

      setEditMode({
        title: false,
        description: false,
        startDate: false,
        endDate: false,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[600px] relative animate-fadeIn">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Project Information
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-10 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="space-y-5 text-gray-700">
            <EditRow
              label="Project Name"
              icon={<Type className="h-4 w-4 text-blue-500" />}
              value={formData.title || ""}
              editable={editMode.title}
              onEdit={() => setEditMode((e) => ({ ...e, title: true }))}
              onChange={(v) => setFormData((p) => ({ ...p, title: v }))}
            />

            <EditRow
              label="Description"
              icon={<FileText className="h-4 w-4 text-blue-500" />}
              value={formData.description || ""}
              editable={editMode.description}
              textarea
              onEdit={() => setEditMode((e) => ({ ...e, description: true }))}
              onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
            />

            <EditRow
              label="Start Date"
              icon={<Calendar className="h-4 w-4 text-green-600" />}
              value={formData.startDate || ""}
              editable={editMode.startDate}
              type="date"
              onEdit={() => setEditMode((e) => ({ ...e, startDate: true }))}
              onChange={(v) => setFormData((p) => ({ ...p, startDate: v }))}
            />

            <EditRow
              label="End Date"
              icon={<Calendar className="h-4 w-4 text-red-500" />}
              value={formData.endDate || ""}
              editable={editMode.endDate}
              type="date"
              onEdit={() => setEditMode((e) => ({ ...e, endDate: true }))}
              onChange={(v) => setFormData((p) => ({ ...p, endDate: v }))}
            />
          </div>
        )}

        <div className="mt-8 flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Huỷ
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function EditRow({
  label,
  icon,
  value,
  editable,
  textarea,
  type,
  onEdit,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  editable: boolean;
  textarea?: boolean;
  type?: string;
  onEdit: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
        {icon} {label}
      </label>

      {!editable ? (
        <div
          className="flex items-center justify-between bg-gray-50 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          onClick={onEdit}
        >
          <span>
            {type === "date" && value
              ? new Date(value).toLocaleDateString("vi-VN")
              : value || `Unknow ${label.toLowerCase()}`}
          </span>
          <PencilIcon />
        </div>
      ) : textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      ) : (
        <input
          type={type ?? "text"}
          value={type === "date" && value ? value.split("T")[0] : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      )}
    </div>
  );
}

const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 13v7h7l9-9a2.828 2.828 0 00-4-4L4 13z" />
  </svg>
);
