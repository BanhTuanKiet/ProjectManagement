"use client";

interface Task {
  assignee: string;
}

export default function UserTaskList({ tasks }: { tasks: Task[] }) {
  const userCount = tasks.reduce((acc, t) => {
    acc[t.assignee] = (acc[t.assignee] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ul className="space-y-2">
      {Object.entries(userCount).map(([user, count]) => (
        <li
          key={user}
          className="flex justify-between border rounded-md px-3 py-2"
        >
          <span className="font-medium">{user}</span>
          <span className="text-sm text-gray-500">{count} tasks</span>
        </li>
      ))}
    </ul>
  );
}
