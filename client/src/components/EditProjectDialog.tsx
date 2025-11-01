"use client";

import { useEffect, useState } from "react";
import axios from "@/config/axiosConfig";
import {
  Calendar,
  User,
  FileText,
  Type,
  Save,
  XCircle,
  Loader2,
  Check,
} from "lucide-react";
import type { ProjectBasic } from "@/utils/IProject";

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

  const [editTitle, setEditTitle] = useState(false);
  const [editDesc, setEditDesc] = useState(false);
  const [editStartDate, setEditStartDate] = useState(false);
  const [editDueDate, setEditDueDate] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!open || !projectId) return;
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/projects/getProjectBasic/${projectId}`);
        const data = response.data;
        setProject(data);
        setTitle(data.name || "");
        setDescription(data.description || "");
        setStartDate(data.startDate || "");
        setDueDate(data.endDate || "");
      } catch (error) {
        console.error("Fetch project detail error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [open, projectId]);

  const handleTitleSave = async () => {
    setEditTitle(false);
    if (!title || title === project?.name) return;

    try {
      setSaving(true);
      await axios.put(`/projects/updateTitle/${projectId}`, { name: title });
      setProject((prev) => (prev ? { ...prev, name: title } : null));
    } catch (error) {
      console.error("Update title error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDescriptionSave = async () => {
    setEditDesc(false);
    if (description === project?.description) return;

    try {
      setSaving(true);
      await axios.put(`/projects/updateDescription/${projectId}`, { description });
      setProject((prev) => (prev ? { ...prev, description } : null));
    } catch (error) {
      console.error("Update description error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleStartDateSave = async () => {
    setEditStartDate(false);
    if (!startDate || startDate === project?.startDate) return;

    try {
      setSaving(true);
      await axios.put(`/projects/updateStartDate/${projectId}`, { startDate });
      setProject((prev) => (prev ? { ...prev, startDate } : null));
    } catch (error) {
      console.error("Update startDate error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDueDateSave = async () => {
    setEditDueDate(false);
    if (!dueDate || dueDate === project?.endDate) return;

    try {
      setSaving(true);
      await axios.put(`/projects/updateEndDate/${projectId}`, { endDate: dueDate });
      setProject((prev) => (prev ? { ...prev, endDate: dueDate } : null));
    } catch (error) {
      console.error("Update endDate error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => onOpenChange(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[600px] relative animate-fadeIn">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Thông tin dự án
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-10 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Đang tải dữ liệu...
          </div>
        ) : (
          project && (
            <div className="space-y-5 text-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Type className="h-4 w-4 text-blue-500" /> Tên dự án
                </label>
                {!editTitle ? (
                  <div
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => setEditTitle(true)}
                  >
                    <span>{title || "Chưa có tên"}</span>
                    <PencilIcon />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <SaveButton onClick={handleTitleSave} saving={saving} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <FileText className="h-4 w-4 text-blue-500" /> Mô tả
                </label>
                {!editDesc ? (
                  <div
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => setEditDesc(true)}
                  >
                    <span>{description || "Chưa có mô tả"}</span>
                    <PencilIcon />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <SaveButton onClick={handleDescriptionSave} saving={saving} />
                  </div>
                )}
              </div>

              {/* 🔹 Chủ sở hữu
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <User className="h-4 w-4 text-blue-500" /> Chủ sở hữu
                </label>
                <div className="bg-gray-50 p-2 rounded-md">{project.owner}</div>
              </div> */}

              <DateRow
                label="Ngày bắt đầu"
                icon={<Calendar className="h-4 w-4 text-green-600" />}
                value={startDate}
                edit={editStartDate}
                setEdit={setEditStartDate}
                onSave={handleStartDateSave}
                setValue={setStartDate}
              />

              <DateRow
                label="Ngày kết thúc"
                icon={<Calendar className="h-4 w-4 text-red-500" />}
                value={dueDate}
                edit={editDueDate}
                setEdit={setEditDueDate}
                onSave={handleDueDateSave}
                setValue={setDueDate}
              />
            </div>
          )
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

const SaveButton = ({ onClick, saving }: { onClick: () => void; saving: boolean }) => (
  <button
    onClick={onClick}
    disabled={saving}
    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center"
  >
    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
  </button>
);

const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536M4 13v7h7l9-9a2.828 2.828 0 00-4-4L4 13z"
    />
  </svg>
);

function DateRow({
  label,
  icon,
  value,
  edit,
  setEdit,
  setValue,
  onSave,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  edit: boolean;
  setEdit: (v: boolean) => void;
  setValue: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
        {icon} {label}
      </label>

      {!edit ? (
        <div
          className="flex items-center justify-between bg-gray-50 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          onClick={() => setEdit(true)}
        >
          <span>
            {value
              ? new Date(value).toLocaleDateString("vi-VN")
              : `Thêm ${label.toLowerCase()}`}
          </span>
          <PencilIcon />
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="date"
            autoFocus
            value={value ? new Date(value).toISOString().split("T")[0] : ""}
            onChange={(e) => setValue(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <SaveButton onClick={onSave} saving={false} />
        </div>
      )}
    </div>
  );
}