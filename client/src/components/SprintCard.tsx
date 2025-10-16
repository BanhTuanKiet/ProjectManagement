import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, MoreHorizontal, Plus } from 'lucide-react';

interface SprintProps {
  sprintName?: string;
  workItemCount?: number;
  todoCount?: number;
  inProgressCount?: number;
  doneCount?: number;
  totalEstimate?: number;
}

export default function SprintCard({
  sprintName = "SCRUM Sprint 1",
  workItemCount = 0,
  todoCount = 0,
  inProgressCount = 0,
  doneCount = 0,
  totalEstimate = 0
}: SprintProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-gray-300 rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <h3 className="font-semibold text-gray-900">{sprintName}</h3>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <Calendar size={16} />
            <span>Add dates</span>
          </button>
          <span className="text-sm text-gray-500">({workItemCount} work items)</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded">
              {todoCount}
            </span>
            <span className="px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded">
              {inProgressCount}
            </span>
            <span className="px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded">
              {doneCount}
            </span>
          </div>
          <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            Start sprint
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-8">
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12">
            {/* Illustration */}
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute top-0 left-4 w-12 h-12 bg-purple-500 rounded-tl-full transform -rotate-45"></div>
              <div className="absolute top-4 right-2 w-10 h-10 bg-yellow-400 rounded-full"></div>
              <div className="absolute bottom-2 left-8 w-8 h-8 bg-orange-500 rounded-full"></div>
              <div className="absolute bottom-0 right-4 w-10 h-10 bg-green-500 rounded"></div>
              <div className="absolute bottom-4 left-12 w-6 h-1 bg-gray-800 rounded"></div>
            </div>

            {/* Text Content */}
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Plan your sprint</h4>
            <p className="text-sm text-gray-600 text-center max-w-md">
              Drag work items from the <span className="font-semibold">Backlog</span> section or create new ones to plan the work
              for this sprint. Select <span className="font-semibold">Start sprint</span> {"when you're ready."}
            </p>
          </div>

          {/* Create Button */}
          <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mt-4">
            <Plus size={16} />
            <span>Create</span>
          </button>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{workItemCount} of {workItemCount} work items visible</span>
            </div>
            <div className="text-sm text-gray-600">
              Estimate: <span className="font-medium">{totalEstimate} of {totalEstimate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}