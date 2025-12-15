'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { Team, Project } from '@/types'

export default function TeamPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string

  const [team, setTeam] = useState<Team | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = React.useCallback(async () => {
    try {
      const [teamData, projectsData] = await Promise.all([
        api.teams.getById(teamId),
        api.projects.getByTeam(teamId),
      ])
      setTeam(teamData)
      setProjects(projectsData)
    } catch (error) {
      // Error loading team data
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateProject = async () => {
    const name = prompt('Enter project name:')
    const key = prompt('Enter project key (e.g., PROJ):')?.toUpperCase()

    if (name && key) {
      try {
        const project = await api.projects.create({
          teamId,
          name,
          key,
        })
        setProjects([...projects, project])
      } catch (error: any) {
        alert(error.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading team...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Team not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold mt-2">{team.name}</h1>
              <p className="text-muted-foreground">{team.description}</p>
            </div>
            <Button onClick={handleCreateProject}>New Project</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          <div className="flex gap-2 flex-wrap">
            {team.members?.map((member) => (
              <div
                key={member.id}
                className="bg-white border rounded-lg px-4 py-2 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          {projects.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No projects yet</CardTitle>
                <CardDescription>Create your first project to start managing sprints</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {project.name}
                      <span className="text-xs font-mono text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                        {project.key}
                      </span>
                    </CardTitle>
                    <CardDescription>{project.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{(project as any)._count?.tasks || 0} tasks</span>
                      <span>{(project as any)._count?.sprints || 0} sprints</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
