'use client'

import { useState } from 'react'
import { User } from '@/types'
import { Button } from '@/components/ui/button'

interface AssignUserModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (userId: string | null) => void
  teamMembers: User[]
  currentAssignee?: User | null
}

export function AssignUserModal({
  isOpen,
  onClose,
  onAssign,
  teamMembers,
  currentAssignee,
}: AssignUserModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    currentAssignee?.id || null
  )

  if (!isOpen) return null

  const handleAssign = () => {
    onAssign(selectedUserId)
    onClose()
  }

  const handleUnassign = () => {
    onAssign(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Assign Task</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select a team member to assign this task to:
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No team members available
            </p>
          ) : (
            teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedUserId(member.id)}
                className={`w-full text-left p-3 rounded-md border transition-colors ${
                  selectedUserId === member.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                  </div>
                  {selectedUserId === member.id && (
                    <div className="text-blue-600">✓</div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2">
          {currentAssignee && (
            <Button
              variant="outline"
              onClick={handleUnassign}
              className="flex-1"
            >
              Unassign
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedUserId}
            className="flex-1"
          >
            Assign
          </Button>
        </div>
      </div>
    </div>
  )
}
