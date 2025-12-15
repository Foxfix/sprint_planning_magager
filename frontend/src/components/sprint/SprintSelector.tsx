'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sprint } from '@/types'
import { ChevronDown, Play, CheckCircle2, Calendar } from 'lucide-react'

interface SprintSelectorProps {
  sprints: Sprint[]
  activeSprint: Sprint | null
  selectedSprint: Sprint | null
  viewBacklog: boolean
  viewAllTasks: boolean
  onSprintChange: (sprint: Sprint | null, isBacklog?: boolean, showAllTasks?: boolean) => void
  onStartSprint: (sprintId: string) => Promise<void>
  onCompleteSprint: (sprintId: string) => Promise<void>
}

export function SprintSelector({
  sprints,
  activeSprint,
  selectedSprint,
  viewBacklog,
  viewAllTasks,
  onSprintChange,
  onStartSprint,
  onCompleteSprint,
}: SprintSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getSprintsByStatus = (status: string) => {
    return sprints.filter((s) => s.status === status)
  }

  const plannedSprints = getSprintsByStatus('PLANNED')
  const completedSprints = getSprintsByStatus('COMPLETED')

  const handleStartSprint = async (sprintId: string) => {
    await onStartSprint(sprintId)
    setIsOpen(false)
  }

  const handleCompleteSprint = async (sprintId: string) => {
    if (confirm('Are you sure you want to complete this sprint? All incomplete tasks will be moved to backlog.')) {
      await onCompleteSprint(sprintId)
    }
  }

  const handleSelectSprint = (sprint: Sprint | null, isBacklog?: boolean, showAllTasks?: boolean) => {
    onSprintChange(sprint, isBacklog, showAllTasks)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* All Tasks View Display */}
      {viewAllTasks && (
        <div className="mb-4 bg-purple-50 border border-purple-300 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-purple-700">All Tasks</h2>
                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                  VIEWING
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Viewing all project tasks (no filter)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              Change View <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Backlog View Display */}
      {!viewAllTasks && viewBacklog && (
        <div className="mb-4 bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-gray-700">Backlog</h2>
                <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">
                  VIEWING
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Tasks not assigned to any sprint
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              Change View <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Active Sprint Display */}
      {!viewAllTasks && !viewBacklog && activeSprint && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-blue-700">{activeSprint.name}</h2>
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(activeSprint.startDate).toLocaleDateString()} -{' '}
                {new Date(activeSprint.endDate).toLocaleDateString()}
              </p>
              {activeSprint.goal && (
                <p className="text-sm text-gray-700 mt-2 italic">{activeSprint.goal}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                Change Sprint <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleCompleteSprint(activeSprint.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Complete Sprint
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* No Active Sprint */}
      {!viewAllTasks && !viewBacklog && !activeSprint && (
        <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">No Active Sprint</h3>
              <p className="text-sm text-gray-600">
                {plannedSprints.length > 0
                  ? 'Start a sprint to begin tracking tasks'
                  : 'Create a sprint to get started'}
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              View Options <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Sprint Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {/* Backlog Option */}
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Backlog
            </h4>
            <button
              onClick={() => handleSelectSprint(null, true)}
              className={`w-full text-left p-3 hover:bg-gray-50 rounded-md border ${
                viewBacklog ? 'border-gray-400 bg-gray-50' : 'border-gray-200'
              }`}
            >
              <h5 className="font-medium">Backlog</h5>
              <p className="text-xs text-gray-500 mt-1">View tasks not assigned to any sprint</p>
            </button>
          </div>

          {/* Active Sprint - for switching back */}
          {activeSprint && (
            <div className="p-3 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Active Sprint
              </h4>
              <button
                onClick={() => handleSelectSprint(activeSprint, false)}
                className={`w-full text-left p-3 hover:bg-blue-50 rounded-md border ${
                  selectedSprint?.id === activeSprint.id && !viewBacklog
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-blue-700">{activeSprint.name}</h5>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(activeSprint.startDate).toLocaleDateString()} -{' '}
                      {new Date(activeSprint.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Planned Sprints */}
          {plannedSprints.length > 0 && (
            <div className="p-3 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Planned Sprints
              </h4>
              {plannedSprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="p-3 hover:bg-gray-50 rounded-md mb-2 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium">{sprint.name}</h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sprint.startDate).toLocaleDateString()} -{' '}
                        {new Date(sprint.endDate).toLocaleDateString()}
                      </p>
                      {sprint.goal && (
                        <p className="text-xs text-gray-500 mt-1 italic">{sprint.goal}</p>
                      )}
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStartSprint(sprint.id)}
                      disabled={!!activeSprint}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start Sprint
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Tasks Option */}
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              View Options
            </h4>
            <button
              onClick={() => handleSelectSprint(null, false, true)}
              className={`w-full text-left p-3 hover:bg-purple-50 rounded-md border ${
                viewAllTasks ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <h5 className="font-medium">All Tasks (No Sprint Filter)</h5>
              <p className="text-xs text-gray-500 mt-1">View all project tasks</p>
            </button>
          </div>

          {/* Completed Sprints */}
          {completedSprints.length > 0 && (
            <div className="p-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Completed Sprints
              </h4>
              {completedSprints.slice(0, 5).map((sprint) => (
                <button
                  key={sprint.id}
                  onClick={() => handleSelectSprint(sprint, false)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-md mb-2 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{sprint.name}</h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sprint.startDate).toLocaleDateString()} -{' '}
                        {new Date(sprint.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Sprints */}
          {sprints.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">No sprints created yet</p>
              <p className="text-xs mt-1">Click &quot;New Sprint&quot; to create one</p>
            </div>
          )}

          {/* Close Button */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
