import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';

interface AccessDeniedScreenProps {
  role: 'staff' | 'admin';
}

export default function AccessDeniedScreen({ role }: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <CardTitle>Access Denied</CardTitle>
          </div>
          <CardDescription>
            You do not have permission to access the {role} area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {role === 'staff'
              ? 'Only authorized staff members can access this area. Please contact your administrator if you believe this is an error.'
              : 'Only platform administrators can access this area.'}
          </p>
          <Button className="w-full" onClick={() => navigate({ to: '/' })}>
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
