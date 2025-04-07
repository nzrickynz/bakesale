import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface CauseFormProps {
  title: string;
  description: string;
  goalAmount?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function CauseForm({
  title,
  description,
  goalAmount,
  startDate,
  endDate,
  status,
  onSubmit,
  isSubmitting,
}: CauseFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" defaultValue={title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" defaultValue={description} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goalAmount">Goal Amount</Label>
        <Input id="goalAmount" type="number" defaultValue={goalAmount} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input id="startDate" type="date" defaultValue={startDate} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <Input id="endDate" type="date" defaultValue={endDate} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" defaultValue={status} className="w-full">
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
} 