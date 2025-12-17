"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ColoredAvatar from "./ColoredAvatar";
import { useProject } from "@/app/(context)/ProjectContext";
import { useState } from "react";
import axios from "@/config/axiosConfig";

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateTaskDialogJira({ open, onClose }: CreateTaskDialogProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: 1,
    deadline: "",
  });

  const { members, project_name } = useProject();

  const getMinDeadline = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const minDeadline = getMinDeadline();

  const update = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "deadline") {
      if (value && value < minDeadline) {
        alert("Deadline must be at least tomorrow.");
        return setForm({ ...form, deadline: "" });
      }
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const projectId = project_name;

      const payload = {
        ...form,
        priority: Number(form.priority),
        deadline: form.deadline
          ? new Date(form.deadline).toLocaleString("sv-SE").replace(" ", "T")
          : null,
      };

      const response = await axios.post(`/tasks/view/${projectId}`, payload);

      console.log("Task created:", response.data);

      setForm({
        title: "",
        description: "",
        assigneeId: "",
        priority: 1,
        deadline: "",
      });

      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-6 rounded-lg shadow-lg border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Create Issue</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="col-span-2">
            <Label className="text-sm font-medium text-gray-700">Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={update}
              className="mt-1"
              placeholder="Enter issue title"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Priority</Label>
            <select
              name="priority"
              value={form.priority}
              onChange={update}
              className="w-full mt-1 border rounded-md h-10 px-2"
            >
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Deadline</Label>
            <Input
              name="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={update}
              min={minDeadline}
              className="mt-1"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={update}
              className="mt-1 min-h-24"
              placeholder="Describe the issue..."
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm font-medium text-gray-700">Assignee</Label>

            <Select
              value={form.assigneeId}
              onValueChange={(v) => setForm({ ...form, assigneeId: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>

              <SelectContent>
                {members?.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    <div className="flex items-center gap-2">
                      <ColoredAvatar src={m.avatarUrl} id={m.userId} size="sm" name={m.name} />
                      <span>{m.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-[#0052CC] hover:bg-[#0747A6]"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
