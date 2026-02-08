import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface AuthGateErrorCardProps {
  role: 'admin' | 'staff';
  error: Error | unknown;
  onRetry: () => void;
}

export default function AuthGateErrorCard({ role, error, onRetry }: AuthGateErrorCardProps) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="border-warning">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-8 w-8 text-warning" />
            <CardTitle>Authorization Check Failed</CardTitle>
          </div>
          <CardDescription>
            We couldn't verify your {role} access right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              <strong>Error:</strong> {errorMessage}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            This could be a temporary network issue or a backend problem. Please try again.
          </p>
          <Button className="w-full" onClick={onRetry}>
            Retry Authorization Check
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
