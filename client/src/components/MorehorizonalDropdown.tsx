"use client";

import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function ProjectMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>Add to starred</DropdownMenuItem>
        <DropdownMenuItem>Invite people</DropdownMenuItem>
        <DropdownMenuItem>Save as project template</DropdownMenuItem>
        <DropdownMenuItem>Set project background</DropdownMenuItem>
        <DropdownMenuItem>Archive project</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">
          Delete project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
