import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AdminDiagnostics } from '../../hooks/useAdminDiagnostics';

interface AuthGateErrorCardProps {
  role: 'admin' | 'staff';
  error: Error | unknown;
  onRetry: () => void;
  principalString?: string | null;
  adminCheckResult?: boolean;
  staffAccountPresent?: boolean;
  diagnostics?: AdminDiagnostics;
}

export default function AuthGateErrorCard({ 
  role, 
  error, 
  onRetry,
  principalString,
  adminCheckResult,
  staffAccountPresent,
  diagnostics
}: AuthGateErrorCardProps) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

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

          {(principalString || diagnostics) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Diagnostics</h4>
                <div className="rounded-md bg-muted p-3 space-y-1 text-xs font-mono">
                  {diagnostics ? (
                    <>
                      <div>
                        <span className="text-muted-foreground">Principal:</span>
                        <div className="break-all mt-1">{diagnostics.callerPrincipal}</div>
                      </div>
                      {role === 'admin' && (
                        <>
                          <div>
                            <span className="text-muted-foreground">Is Admin:</span> {diagnostics.isAdmin ? 'true' : 'false'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">User Role:</span> {diagnostics.userRole}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Has User Permission:</span> {diagnostics.hasUserPermission ? 'true' : 'false'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Has Admin Permission:</span> {diagnostics.hasAdminPermission ? 'true' : 'false'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Admins:</span> {diagnostics.totalAdmins.toString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Users:</span> {diagnostics.totalUsers.toString()}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-muted-foreground">Principal:</span>
                        <div className="break-all mt-1">{principalString}</div>
                      </div>
                      {role === 'admin' && adminCheckResult !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Admin:</span> {adminCheckResult ? 'true' : 'false'}
                        </div>
                      )}
                      {role === 'staff' && staffAccountPresent !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Staff Account:</span> {staffAccountPresent ? 'present' : 'not found'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button className="flex-1" onClick={onRetry}>
              Retry
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
