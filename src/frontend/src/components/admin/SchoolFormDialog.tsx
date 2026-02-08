import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateSchool, useUpdateSchool } from '../../hooks/useAdmin';
import { School } from '../../backend';
import { Loader2 } from 'lucide-react';

interface SchoolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  onSuccess: () => void;
}

export default function SchoolFormDialog({
  open,
  onOpenChange,
  school,
  onSuccess,
}: SchoolFormDialogProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();

  useEffect(() => {
    if (school) {
      setName(school.name);
      setAddress(school.address);
    } else {
      setName('');
      setAddress('');
    }
  }, [school, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (school) {
        await updateSchool.mutateAsync({
          schoolId: school.id,
          name,
          address,
        });
      } else {
        await createSchool.mutateAsync({ name, address });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save school:', error);
    }
  };

  const isPending = createSchool.isPending || updateSchool.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{school ? 'Edit School' : 'Add School'}</DialogTitle>
          <DialogDescription>
            {school ? 'Update school information' : 'Create a new school in the platform'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lincoln High School"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Main St, City, State"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim() || !address.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : school ? (
                'Update School'
              ) : (
                'Create School'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
