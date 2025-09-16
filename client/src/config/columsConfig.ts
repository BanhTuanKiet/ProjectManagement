// src/constants/columnsConfig.ts
export interface Column {
  key: string;
  title: string;
  width: number;
  minWidth: number;
  resizable: boolean;
}

export const initialColumns: Column[] = [
  { key: "select", title: "", width: 65, minWidth: 65, resizable: false },
  { key: "type", title: "Type", width: 110, minWidth: 80, resizable: true },
  { key: "key", title: "Key", width: 120, minWidth: 80, resizable: true },
  {
    key: "summary",
    title: "Summary",
    width: 400,
    minWidth: 200,
    resizable: true,
  },
  {
    key: "status",
    title: "Status",
    width: 120,
    minWidth: 100,
    resizable: true,
  },
  {
    key: "assignee",
    title: "Assignee",
    width: 180,
    minWidth: 120,
    resizable: true,
  },
  {
    key: "dueDate",
    title: "Due date",
    width: 145,
    minWidth: 120,
    resizable: true,
  },
  {
    key: "priority",
    title: "Priority",
    width: 120,
    minWidth: 100,
    resizable: true,
  },
  {
    key: "comments",
    title: "Comments",
    width: 145,
    minWidth: 120,
    resizable: true,
  },
  {
    key: "labels",
    title: "Labels",
    width: 170,
    minWidth: 120,
    resizable: true,
  },
  {
    key: "created",
    title: "Created",
    width: 145,
    minWidth: 120,
    resizable: true,
  },
  {
    key: "updated",
    title: "Updated",
    width: 145,
    minWidth: 120,
    resizable: true,
  },
  {
    key: "reporter",
    title: "Reporter",
    width: 180,
    minWidth: 120,
    resizable: true,
  },
  { key: "team", title: "Team", width: 160, minWidth: 120, resizable: true },
];
