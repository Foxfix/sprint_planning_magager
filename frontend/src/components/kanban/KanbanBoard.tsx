'use client'

import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { Task, TaskStatus, Sprint } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: TaskStatus, newSprintId?: string | null) => Promise<void>
  onTaskClick: (task: Task) => void
  sprints?: Sprint[]
  activeSprint?: Sprint | null
  allTasks?: Task[]
  viewingActiveSprint?: boolean
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'IN_REVIEW', title: 'In Review' },
  { id: 'DONE', title: 'Done' },
]

export function KanbanBoard({ tasks, onTaskMove, onTaskClick, sprints, activeSprint, allTasks, viewingActiveSprint }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    // When viewing active sprint, we need to look in allTasks for backlog items
    const allAvailableTasks = viewingActiveSprint && allTasks ? allTasks : tasks
    const task = allAvailableTasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Special handling for backlog drop zone
    if (overId === 'BACKLOG') {
      const task = (viewingActiveSprint && allTasks ? allTasks : tasks).find((t) => t.id === taskId)
      if (task) {
        await onTaskMove(taskId, task.status, null)
      }
      setActiveTask(null)
      return
    }

    // Special handling for sprint drop zone
    if (overId === 'SPRINT' && activeSprint) {
      const task = (viewingActiveSprint && allTasks ? allTasks : tasks).find((t) => t.id === taskId)
      if (task) {
        await onTaskMove(taskId, task.status, activeSprint.id)
      }
      setActiveTask(null)
      return
    }

    // over.id might be a task ID or a column ID (status)
    // If it's a task ID, find the task's status instead
    const droppedOnTask = tasks.find((t) => t.id === over.id)
    const newStatus = droppedOnTask ? droppedOnTask.status : (over.id as TaskStatus)

    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      await onTaskMove(taskId, newStatus)
    }

    setActiveTask(null)
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  const backlogTasks = viewingActiveSprint && allTasks
    ? allTasks.filter((t) => !t.sprintId)
    : []

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`grid gap-4 h-full ${viewingActiveSprint ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-4'}`}>
        {viewingActiveSprint && (
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

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging sprints={sprints} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
