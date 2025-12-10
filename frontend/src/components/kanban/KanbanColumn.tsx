import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, Sprint } from '@/types'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  sprints?: Sprint[]
  isBacklog?: boolean
}

export function KanbanColumn({ id, title, tasks, onTaskClick, sprints, isBacklog }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col h-full">
      <div className={`border rounded-lg p-4 flex-1 flex flex-col ${
        isBacklog
          ? 'bg-amber-50 border-amber-300'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded ${
            isBacklog
              ? 'text-amber-700 bg-amber-200'
              : 'text-gray-500 bg-gray-200'
          }`}>
            {tasks.length}
          </span>
        </div>

        <div
          ref={setNodeRef}
          className={`flex-1 space-y-2 min-h-[200px] p-2 rounded-md transition-colors ${
            isOver
              ? (isBacklog ? 'bg-amber-100' : 'bg-blue-50')
              : 'bg-white'
          }`}
        >
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} sprints={sprints} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  )
}
