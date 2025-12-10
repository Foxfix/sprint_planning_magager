'use client'

import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { Task, TaskStatus, Sprint, User } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { AssignUserModal } from '../task/AssignUserModal'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: TaskStatus, newSprintId?: string | null, assigneeId?: string | null) => Promise<void>
  onTaskClick: (task: Task) => void
  sprints?: Sprint[]
  activeSprint?: Sprint | null
  allTasks?: Task[]
  viewingActiveSprint?: boolean
  teamMembers?: User[]
  viewBacklog?: boolean
  viewingSprint?: boolean
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'IN_REVIEW', title: 'In Review' },
  { id: 'DONE', title: 'Done' },
]

export function KanbanBoard({ tasks, onTaskMove, onTaskClick, sprints, activeSprint, allTasks, viewingActiveSprint, teamMembers = [], viewBacklog = false, viewingSprint = false }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [pendingMove, setPendingMove] = useState<{
    taskId: string
    newStatus: TaskStatus
    newSprintId?: string | null
    task: Task
  } | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    // When viewing any sprint with backlog column, we need to look in allTasks
    const allAvailableTasks = (viewingActiveSprint || viewingSprint) && allTasks ? allTasks : tasks
    const task = allAvailableTasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id as string
    const overId = over.id as string
    const allAvailableTasks = (viewingActiveSprint || viewingSprint) && allTasks ? allTasks : tasks
    const task = allAvailableTasks.find((t) => t.id === taskId)

    if (!task) {
      setActiveTask(null)
      return
    }

    // Don't allow moving tasks from DONE column
    if (task.status === 'DONE') {
      setActiveTask(null)
      return
    }

    // Determine the new status based on where it was dropped
    let newStatus = task.status
    let newSprintId: string | undefined | null = task.sprintId

    // Special handling for backlog drop zone
    if (overId === 'BACKLOG') {
      newSprintId = null
      // Keep the same status when moving to backlog
    }
    // Special handling for sprint drop zone (not implemented, but reserved)
    else if (overId === 'SPRINT' && activeSprint) {
      newSprintId = activeSprint.id
      // Keep the same status when moving to sprint
    }
    // Dropped on a task or column
    else {
      // Look for the dropped task in the correct task list
      const droppedOnTask = allAvailableTasks.find((t) => t.id === overId)

      // If dropped on a task in backlog (task without sprintId), move to backlog
      if (droppedOnTask && !droppedOnTask.sprintId) {
        newSprintId = null
        // Keep the same status when moving to backlog
      }
      // If dropped on a task, use that task's status
      else if (droppedOnTask) {
        newStatus = droppedOnTask.status
        // If task is from backlog and we're viewing a sprint, assign it to that sprint
        if (!task.sprintId && (viewingActiveSprint || viewingSprint) && activeSprint) {
          newSprintId = activeSprint.id
        }
      }
      // Dropped on a column
      else {
        newStatus = overId as TaskStatus
        // If task is from backlog and we're viewing a sprint, assign it to that sprint
        if (!task.sprintId && (viewingActiveSprint || viewingSprint) && activeSprint) {
          newSprintId = activeSprint.id
        }
      }
    }

    // Check if anything changed
    const statusChanged = task.status !== newStatus
    const sprintChanged = task.sprintId !== newSprintId

    if (!statusChanged && !sprintChanged) {
      setActiveTask(null)
      return
    }

    // If moving to IN_PROGRESS and no assignee, show assignment modal
    if (newStatus === 'IN_PROGRESS' && !task.assignee && teamMembers.length > 0) {
      setPendingMove({
        taskId,
        newStatus,
        newSprintId: newSprintId,
        task,
      })
      setAssignModalOpen(true)
      setActiveTask(null)
      return
    }

    // Perform the move
    await onTaskMove(taskId, newStatus, newSprintId, task.assignee?.id || null)
    setActiveTask(null)
  }

  const handleAssignUser = async (assigneeId: string | null) => {
    if (pendingMove) {
      await onTaskMove(
        pendingMove.taskId,
        pendingMove.newStatus,
        pendingMove.newSprintId,
        assigneeId
      )
      setPendingMove(null)
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  const backlogTasks = (viewingActiveSprint || viewingSprint) && allTasks
    ? allTasks.filter((t) => !t.sprintId && t.status !== 'DONE')
    : []

  return (
    <>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {viewBacklog ? (
          // Backlog view - only show one column with all backlog tasks
          <div className="grid gap-4 h-full grid-cols-1">
            <KanbanColumn
              key="BACKLOG"
              id="BACKLOG"
              title="Backlog"
              tasks={tasks}
              onTaskClick={onTaskClick}
              sprints={sprints}
              isBacklog={true}
            />
          </div>
        ) : (
          // Sprint view - show status columns
          <div className={`grid gap-4 h-full ${(viewingActiveSprint || viewingSprint) ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-4'}`}>
            {(viewingActiveSprint || viewingSprint) && (
              <KanbanColumn
                key="BACKLOG"
                id="BACKLOG"
                title="Backlog"
                tasks={backlogTasks}
                onTaskClick={onTaskClick}
                sprints={sprints}
                isBacklog={true}
              />
            )}
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={getTasksByStatus(column.id)}
                onTaskClick={onTaskClick}
                sprints={sprints}
              />
            ))}
          </div>
        )}

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging sprints={sprints} /> : null}
        </DragOverlay>
      </DndContext>

      <AssignUserModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false)
          setPendingMove(null)
        }}
        onAssign={handleAssignUser}
        teamMembers={teamMembers}
        currentAssignee={pendingMove?.task.assignee}
      />
    </>
  )
}
