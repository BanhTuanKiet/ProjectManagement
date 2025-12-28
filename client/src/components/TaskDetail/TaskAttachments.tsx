import axios from "@/config/axiosConfig";
import { useEffect, useState } from "react";
import { Paperclip, Trash, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskFile } from "@/utils/Ifile";

function FilePreviewModal({ previewFile, setPreviewFile }: { previewFile: TaskFile | null, setPreviewFile: React.Dispatch<React.SetStateAction<TaskFile | null>> }) {
    if (!previewFile) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] relative">
                <button
                    onClick={() => setPreviewFile(null)}
                    className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                >
                    <X className="h-5 w-5" />
                </button>
                {previewFile.fileType?.includes("image") ? (
                    <img
                        src={previewFile.filePath}
                        alt={previewFile.fileName}
                        className="w-full h-full object-contain"
                    />
                ) : previewFile.fileType?.includes("pdf") ? (
                    <iframe
                        src={previewFile.filePath}
                        className="w-full h-full"
                        title={previewFile.fileName}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-700">
                        <p>Không thể xem trước file này.</p>
                        <a
                            href={previewFile.filePath}
                            download={previewFile.fileName}
                            className="mt-2 text-blue-600 underline"
                        >
                            Tải xuống {previewFile.fileName}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}


interface TaskAttachmentsProps {
    taskId: number;
    projectId: number;
}

export default function TaskAttachments({
    taskId,
    projectId,
}: TaskAttachmentsProps) {
    const [files, setFiles] = useState<TaskFile[]>([]);
    const [previewFile, setPreviewFile] = useState<TaskFile | null>(null);

    // 1. Tự fetch files
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const res = await axios.get(`/files/task/${taskId}`);
                setFiles(res.data);
            } catch (err) {
                console.error("Fetch files error:", err);
            }
        };
        fetchFiles();
    }, [taskId]);

    // 2. Tự xử lý upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("taskId", taskId.toString());
        formData.append("projectId", projectId.toString());

        try {
            const res = await axios.post(`/files/upload/${projectId}`, formData);
            setFiles((prev) => [...prev, res.data]);
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

    // 3. Tự xử lý delete
    const handleDeleteFile = async (fileId: number) => {
        const confirmDelete = confirm("Bạn có chắc muốn xóa file này không?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`/files/${fileId}`, {
                params: { taskId: taskId, projectId: projectId }
            });
            setFiles((prev) => prev.filter((f) => f.fileId !== fileId));
        } catch (err) {
            console.error("Delete file error:", err);
        }
    };

    return (
        <>
            {/* Nút "Add attachment" và input ẩn */}
            <div className="relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        document.getElementById("fileUploadInput")?.click()
                    }
                >
                    <Paperclip className="h-4 w-4 mr-1" />
                    Add attachment
                </Button>
                <input
                    id="fileUploadInput"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                />
            </div>

            {/* Danh sách file (đoạn JSX đầy đủ từ file gốc) */}
            <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Attachments
                </h3>
                {files.length === 0 ? (
                    <p className="text-gray-500 text-sm">No attachments yet.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {files.map((f) => (
                            <div
                                key={f.fileId || f.fileName}
                                className="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
                            >
                                {/* File preview */}
                                {f.fileType?.includes("image") ? (
                                    <img
                                        src={f.filePath}
                                        alt={f.fileName}
                                        className="w-full h-32 object-cover"
                                    />
                                ) : f.fileType?.includes("pdf") ? (
                                    <iframe
                                        src={`${f.filePath}#toolbar=0`}
                                        className="w-full h-32"
                                        title={f.fileName}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-32 bg-gray-100 text-gray-500 text-sm">
                                        📄
                                    </div>
                                )}

                                {/* Footer info */}
                                <div className="p-2 flex flex-col bg-white">
                                    <span className="text-xs font-medium truncate">
                                        {f.fileName}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {f.uploadedAt
                                            ? new Date(f.uploadedAt).toLocaleString()
                                            : "Just now"}
                                    </span>
                                </div>

                                {/* Hover icons */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setPreviewFile(f)}
                                        className="bg-white/80 p-2 rounded-full hover:bg-white"
                                    >
                                        <Eye className="h-4 w-4 text-gray-700" />
                                    </button>

                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(f.filePath);
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url;
                                                a.download = f.fileName || "download";
                                                a.click();
                                                window.URL.revokeObjectURL(url);
                                            } catch (err) {
                                                console.error("Download error:", err);
                                                alert("Không thể tải file xuống!");
                                            }
                                        }}
                                        className="bg-white/90 p-2 rounded-full hover:bg-white transition"
                                        title="Tải xuống"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => handleDeleteFile(f.fileId)}
                                        className="bg-white/80 p-2 rounded-full hover:bg-red-100"
                                    >
                                        <Trash className="h-4 w-4 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Tự render modal preview */}
            <FilePreviewModal
                previewFile={previewFile}
                setPreviewFile={setPreviewFile}
            />
        </>
    );
}