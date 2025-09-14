"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  deadline: string;
}

export default function SummaryCards({ tasks }: { tasks: Task[] }) {
  const totalTasks = tasks.length;
  const overdue = tasks.filter(
    (t) => new Date(t.deadline) < new Date() && t.status !== "Done"
  ).length;

  const nearestDeadline = tasks.reduce((earliest, task) => {
    const taskDate = new Date(task.deadline);
    return !earliest || taskDate < earliest ? taskDate : earliest;
  }, null as Date | null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold">Total Tasks</h2>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold">Overdue Tasks</h2>
          <p className="text-2xl font-bold">{overdue}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold">Nearest Deadline</h2>
          <p className="text-lg">
            {nearestDeadline
              ? format(nearestDeadline, "dd/MM/yyyy")
              : "No deadlines"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
