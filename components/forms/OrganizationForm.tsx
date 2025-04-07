import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface OrganizationFormProps {
  name: string;
  contactEmail: string;
  websiteUrl?: string;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function OrganizationForm({
  name,
  contactEmail,
  websiteUrl,
  onSubmit,
  isSubmitting,
}: OrganizationFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input id="name" defaultValue={name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input id="contactEmail" type="email" defaultValue={contactEmail} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input id="websiteUrl" type="url" defaultValue={websiteUrl} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
} 