import { Task } from "@/utils/mapperUtil";

// Các key đặc biệt không nằm trong Task
type ExtraColumnKey =
  | "select"
  | "key"
  | "assignee"
  | "priority"
  | "reporter"
  | "type";

// Ghép với key trong Task
export type ColumnKey = keyof Task | ExtraColumnKey;

export interface Column {
  key: ColumnKey;
  title: string;
  width: number;
  minWidth: number;
  resizable: boolean;
}

export const initialColumns: Column[] = [
  { key: "select", title: "", width: 80, minWidth: 80, resizable: false },
  { key: "type", title: "Type", width: 170, minWidth: 50, resizable: true },
  { key: "key", title: "Key", width: 120, minWidth: 80, resizable: true },
  {
    key: "summary",
    title: "Summary",
    width: 250,
    minWidth: 250,
    resizable: true,
  },
  {
    key: "status",
    title: "Status",
    width: 150,
    minWidth: 150,
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
    width: 170,
    minWidth: 120,
    resizable: true,
  },
  {
    key: "priority",
    title: "Priority",
    width: 118,
    minWidth: 118,
    resizable: true,
  },
  {
    key: "description",
    title: "Description",
    width: 300,
    minWidth: 300,
    resizable: true,
  },
  // {
  //   key: "labels",
  //   title: "Labels",
  //   width: 170,
  //   minWidth: 120,
  //   resizable: true,
  // },
  {
    key: "created",
    title: "Created",
    width: 145,
    minWidth: 120,
    resizable: true,
  },
  // {
  //   key: "updated",
  //   title: "Updated",
  //   width: 145,
  //   minWidth: 120,
  //   resizable: true,
  // },
  {
    key: "reporter",
    title: "Reporter",
    width: 180,
    minWidth: 120,
    resizable: true,
  },
  // { key: "team", title: "Team", width: 160, minWidth: 120, resizable: true },
];
