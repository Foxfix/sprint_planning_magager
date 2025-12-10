import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, Sprint } from '@/types'
import { AlertCircle, Bug, CheckCircle2, Circle, Calendar } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
  sprints?: Sprint[]
}

const taskTypeIcons = {
  BUG: Bug,
  TASK: Circle,
  STORY: CheckCircle2,
  EPIC: AlertCircle,
}

const priorityColors = {
  URGENT: 'text-red-600',
  HIGH: 'text-orange-600',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-green-600',
}

const labelColors = [
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-yellow-500 text-white',
]

export function TaskCard({ task, onClick, isDragging, sprints = [] }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const TypeIcon = taskTypeIcons[task.type]
  const taskSprint = task.sprintId ? sprints.find((s) => s.id === task.sprintId) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-gray-500">
          {task.project.key}-{task.taskNumber}
        </span>
        <TypeIcon className={`w-4 h-4 ${priorityColors[task.priority]}`} />
      </div>

      <h4 className="text-sm font-medium mb-2 line-clamp-2">{task.title}</h4>

      {taskSprint && (
        <div className="mb-2 flex items-center gap-1 text-xs text-blue-600">
          <Calendar className="w-3 h-3" />
          <span className="font-medium">{taskSprint.name}</span>
          {taskSprint.status === 'ACTIVE' && (
            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] ml-1">
              ACTIVE
            </span>
          )}
        </div>
      )}

      {!task.sprintId && (
        <div className="mb-2 text-xs text-gray-500 italic">
          Backlog
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        {task.assignee && (
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        {task.storyPoints && (
          <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
            {task.storyPoints}
          </span>
        )}
      </div>

      {task.labels.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {task.labels.slice(0, 2).map((label, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded ${labelColors[i % labelColors.length]}`}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
