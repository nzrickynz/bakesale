import { render, screen } from '@testing-library/react';
import { CauseCard } from '@/components/causes/cause-card';
import { CauseStatus } from '@prisma/client';

// Mock Prisma enums
jest.mock('@prisma/client', () => ({
  CauseStatus: {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
  },
}));

describe('CauseCard', () => {
  const mockCause = {
    id: '1',
    title: 'Test Cause',
    description: 'Test Description',
    imageUrl: 'https://example.com/image.jpg',
    targetGoal: 1000,
    startDate: new Date(),
    endDate: new Date(),
    status: CauseStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizationId: 'org-1',
    organization: {
      id: 'org-1',
      name: 'Test Organization',
    },
    listings: [],
  };

  it('renders cause information correctly', () => {
    render(<CauseCard cause={mockCause} />);
    
    expect(screen.getByText('Test Cause')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('displays the cause image', () => {
    render(<CauseCard cause={mockCause} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('alt', 'Test Cause');
  });

  it('shows active status badge for active causes', () => {
    render(<CauseCard cause={mockCause} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows completed status badge for completed causes', () => {
    const completedCause = {
      ...mockCause,
      status: CauseStatus.COMPLETED,
    };
    
    render(<CauseCard cause={completedCause} />);
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
}); 