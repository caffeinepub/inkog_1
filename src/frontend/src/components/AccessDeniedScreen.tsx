import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, LogOut } from 'lucide-react';
import { AdminDiagnostics } from '../hooks/useAdminDiagnostics';

interface AccessDeniedScreenProps {
  role: 'staff' | 'admin';
  principalString?: string | null;
  adminCheckResult?: boolean;
  staffAccountPresent?: boolean;
  diagnostics?: AdminDiagnostics;
  onRetry?: () => void;
}

export default function AccessDeniedScreen({ 
  role, 
  principalString,
  adminCheckResult,
  staffAccountPresent,
  diagnostics,
  onRetry
}: AccessDeniedScreenProps) {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

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
              : 'Only platform administrators can access this area. Your principal must be added to the admin allowlist.'}
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

          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button className="w-full" onClick={onRetry}>
                Retry Authorization Check
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate({ to: '/' })}>
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
