'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { SprintSelector } from '@/components/sprint/SprintSelector'
import { api } from '@/lib/api'
import type { Project, Task, TaskStatus, Sprint, User } from '@/types'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [viewBacklog, setViewBacklog] = useState(false)
  const [viewAllTasks, setViewAllTasks] = useState(false)
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<User[]>([])

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [projectData, sprintsData, tasksData] = await Promise.all([
        api.projects.getById(projectId),
        api.sprints.getByProject(projectId),
        api.tasks.getByProject(projectId),
      ])

      setProject(projectData)
      setSprints(sprintsData)
      setTasks(tasksData)

      const active = sprintsData.find((s: Sprint) => s.status === 'ACTIVE')
      setActiveSprint(active || null)
      setSelectedSprint(active || null)

      // Load team members if project has a team
      if (projectData.teamId) {
        try {
          const teamData = await api.teams.getById(projectData.teamId)
          const members = teamData.members?.map((m: any) => m.user) || []
          setTeamMembers(members)
        } catch (error) {
          // Error loading team members
          setTeamMembers([])
        }
      }
    } catch (error) {
      // Error loading project data
    } finally {
      setLoading(false)
    }
  }

  const handleSprintChange = (sprint: Sprint | null, isBacklog?: boolean, showAllTasks?: boolean) => {
    setSelectedSprint(sprint)
    setViewBacklog(isBacklog || false)
    setViewAllTasks(showAllTasks || false)
  }

  const handleStartSprint = async (sprintId: string) => {
    try {
      await api.sprints.start(sprintId)
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to start sprint')
    }
  }

  const handleCompleteSprint = async (sprintId: string) => {
    try {
      await api.sprints.complete(sprintId)
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to complete sprint')
    }
  }

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus, newSprintId?: string | null, assigneeId?: string | null) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      await api.tasks.move(taskId, {
        status: newStatus,
        position: 0,
        sprintId: newSprintId !== undefined ? newSprintId : task.sprintId,
        assigneeId: assigneeId !== undefined ? assigneeId : task.assignee?.id,
      })

      // Update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus,
                sprintId: newSprintId !== undefined ? newSprintId : t.sprintId,
                assignee: assigneeId !== undefined
                  ? (assigneeId ? teamMembers.find(m => m.id === assigneeId) : undefined)
                  : t.assignee
              }
            : t
        )
      )
    } catch (error) {
      // Error moving task
    }
  }

  const handleTaskClick = (task: Task) => {
    alert(`Task: ${task.title}\n\nClick to view details (not implemented in basic version)`)
  }

  const handleCreateTask = async () => {
    const title = prompt('Enter task title:')
    if (!title) return

    try {
      const newTask = await api.tasks.create(projectId, {
        title,
        type: 'TASK',
        status: 'TODO',
        priority: 'MEDIUM',
        sprintId: activeSprint?.id,
      })
      setTasks([...tasks, newTask])
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleCreateSprint = async () => {
    const name = prompt('Enter sprint name:')
    if (!name) return

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 14)

    try {
      const sprint = await api.sprints.create(projectId, {
        name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      setSprints([...sprints, sprint])
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Project not found</p>
      </div>
    )
  }

  const sprintTasks = viewBacklog
    ? tasks.filter((t) => !t.sprintId && t.status !== 'DONE') // Show only backlog tasks (not completed)
    : viewAllTasks
    ? tasks // Show all tasks
    : selectedSprint
    ? tasks.filter((t) => t.sprintId === selectedSprint.id) // Show selected sprint tasks
    : activeSprint
    ? tasks.filter((t) => t.sprintId === activeSprint.id) // Show active sprint tasks
    : tasks // No sprint, show all tasks

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/teams/${project.team?.id}`)}
              >
                ← Back to Team
              </Button>
              <h1 className="text-2xl font-bold mt-2">
                {project.name} ({project.key})
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCreateSprint}>
                New Sprint
              </Button>
              <Button onClick={handleCreateTask}>
                New Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <SprintSelector
          sprints={sprints}
          activeSprint={activeSprint}
          selectedSprint={selectedSprint}
          viewBacklog={viewBacklog}
          viewAllTasks={viewAllTasks}
          onSprintChange={handleSprintChange}
          onStartSprint={handleStartSprint}
          onCompleteSprint={handleCompleteSprint}
        />

        <div className="h-[calc(100vh-250px)]">
          <KanbanBoard
            tasks={sprintTasks}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
            sprints={sprints}
            activeSprint={activeSprint}
            allTasks={tasks}
            viewingActiveSprint={!viewBacklog && !viewAllTasks && !!activeSprint && selectedSprint?.id === activeSprint.id}
            teamMembers={teamMembers}
            viewBacklog={viewBacklog}
            viewingSprint={!viewBacklog && !viewAllTasks && !!selectedSprint}
          />
        </div>
      </main>
    </div>
  )
}
