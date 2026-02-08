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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateStaff, useUpdateStaff } from '../../hooks/useAdmin';
import { School, StaffAccount } from '../../backend';
import { Principal } from '@dfinity/principal';
import { Loader2 } from 'lucide-react';

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffAccount | null;
  schools: School[];
  onSuccess: () => void;
}

export default function StaffFormDialog({
  open,
  onOpenChange,
  staff,
  schools,
  onSuccess,
}: StaffFormDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [principal, setPrincipal] = useState('');
  const [enabled, setEnabled] = useState(true);

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setEmail(staff.email);
      setSchoolId(staff.schoolId.toString());
      setPrincipal(staff.principal.toString());
      setEnabled(staff.enabled);
    } else {
      setName('');
      setEmail('');
      setSchoolId('');
      setPrincipal('');
      setEnabled(true);
    }
  }, [staff, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (staff) {
        await updateStaff.mutateAsync({
          staffId: staff.id,
          name,
          email,
          enabled,
        });
      } else {
        await createStaff.mutateAsync({
          principal: Principal.fromText(principal),
          schoolId: BigInt(schoolId),
          name,
          email,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save staff:', error);
    }
  };

  const isPending = createStaff.isPending || updateStaff.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Staff Account' : 'Add Staff Account'}</DialogTitle>
          <DialogDescription>
            {staff ? 'Update staff account information' : 'Create a new staff account'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {!staff && (
              <div className="space-y-2">
                <Label htmlFor="principal">Principal ID *</Label>
                <Input
                  id="principal"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="Enter Internet Identity principal"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The staff member's Internet Identity principal
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., john@school.edu"
                required
              />
            </div>
            {!staff && (
              <div className="space-y-2">
                <Label htmlFor="school">School *</Label>
                <Select value={schoolId} onValueChange={setSchoolId} required>
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id.toString()} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {staff && (
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Account Enabled</Label>
                <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                !name.trim() ||
                !email.trim() ||
                (!staff && (!schoolId || !principal.trim()))
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : staff ? (
                'Update Staff'
              ) : (
                'Create Staff'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
