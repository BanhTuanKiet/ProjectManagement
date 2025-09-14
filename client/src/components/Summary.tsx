"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import StatusChart from "./summary/charts/StatusChart";
// import PriorityPie from "./summary/charts/PriorityPie";
import UserTaskList from "./summary/UserTaskList";
import SummaryCards from "./summary/SummaryCards";

const mockTasks = [
  {
    id: 1,
    title: "Phân tích yêu cầu",
    status: "Done",
    priority: "High",
    assignee: "user1",
    deadline: "2025-09-05",
  },
  {
    id: 2,
    title: "Thiết kế UI",
    status: "In Progress",
    priority: "Medium",
    assignee: "user2",
    deadline: "2025-09-15",
  },
  {
    id: 3,
    title: "Xây dựng API",
    status: "To Do",
    priority: "High",
    assignee: "user3",
    deadline: "2025-09-20",
  },
  {
    id: 4,
    title: "Viết test case",
    status: "To Do",
    priority: "Low",
    assignee: "user1",
    deadline: "2025-09-22",
  },
];

export default function SummaryPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Summary</h1>

      {/* Cards */}
      <SummaryCards tasks={mockTasks} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biểu đồ trạng thái */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Task by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChart tasks={mockTasks} />
          </CardContent>
        </Card> */}

        {/* Biểu đồ ưu tiên */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Task by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <PriorityPie tasks={mockTasks} />
          </CardContent>
        </Card> */}
      </div>

      {/* Danh sách user */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Assignee</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTaskList tasks={mockTasks} />
        </CardContent>
      </Card>
    </div>
  );
}
