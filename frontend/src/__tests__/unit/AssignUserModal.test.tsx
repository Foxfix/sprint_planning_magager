import { render, screen, fireEvent } from '@testing-library/react';
import { AssignUserModal } from '@/components/task/AssignUserModal';
import { User } from '@/types';

describe('AssignUserModal', () => {
  const mockTeamMembers: User[] = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: '2024-01-01',
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: '2024-01-01',
    },
  ];

  const mockOnClose = jest.fn();
  const mockOnAssign = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <AssignUserModal
        isOpen={false}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.queryByText('Assign Task')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <AssignUserModal
        isOpen={true}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByText('Assign Task')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display message when no team members available', () => {
    render(
      <AssignUserModal
        isOpen={true}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={[]}
      />
    );

    expect(screen.getByText('No team members available')).toBeInTheDocument();
  });

  it('should select a user when clicked', () => {
    render(
      <AssignUserModal
        isOpen={true}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={mockTeamMembers}
      />
    );

    const johnButton = screen.getByText('John Doe').closest('button');
    fireEvent.click(johnButton!);

    expect(johnButton).toHaveClass('border-blue-500');
  });

  it('should call onAssign with selected user ID when Assign button is clicked', () => {
    render(
      <AssignUserModal
        isOpen={true}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={mockTeamMembers}
      />
    );

    const johnButton = screen.getByText('John Doe').closest('button');
    fireEvent.click(johnButton!);

    const assignButton = screen.getByText('Assign');
    fireEvent.click(assignButton);

    expect(mockOnAssign).toHaveBeenCalledWith('user-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <AssignUserModal
        isOpen={true}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={mockTeamMembers}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnAssign).not.toHaveBeenCalled();
  });

  it('should show Unassign button when there is a current assignee', () => {
    const currentAssignee = mockTeamMembers[0];

    render(
      <AssignUserModal
        isOpen={true}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={mockTeamMembers}
        currentAssignee={currentAssignee}
      />
    );

    expect(screen.getByText('Unassign')).toBeInTheDocument();
  });

  it('should call onAssign with null when Unassign button is clicked', () => {
    const currentAssignee = mockTeamMembers[0];

    render(
      <AssignUserModal
        isOpen={true}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={mockTeamMembers}
        currentAssignee={currentAssignee}
      />
    );

    const unassignButton = screen.getByText('Unassign');
    fireEvent.click(unassignButton);

    expect(mockOnAssign).toHaveBeenCalledWith(null);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable Assign button when no user is selected', () => {
    render(
      <AssignUserModal
        isOpen={true}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={mockTeamMembers}
      />
    );

    const assignButton = screen.getByText('Assign');
    expect(assignButton).toBeDisabled();
  });

  it('should pre-select current assignee', () => {
    const currentAssignee = mockTeamMembers[1];

    render(
      <AssignUserModal
        isOpen={true}
        onClose={mockOnClose}
        onAssign={mockOnAssign}
        teamMembers={mockTeamMembers}
        currentAssignee={currentAssignee}
      />
    );

    const janeButton = screen.getByText('Jane Smith').closest('button');
    expect(janeButton).toHaveClass('border-blue-500');
  });
});
