import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginButton from '../components/auth/LoginButton';
import AdminDashboardPage from './AdminDashboardPage';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import AuthGateErrorCard from '../components/auth/AuthGateErrorCard';
import AdminRoutePasswordGate from '../components/admin/AdminRoutePasswordGate';
import { useAuth } from '../hooks/useAuth';
import { useAdminDiagnostics } from '../hooks/useAdminDiagnostics';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function AdminGatePage() {
  const navigate = useNavigate();
  const [passwordVerified, setPasswordVerified] = useState(false);
  
  const { 
    isAuthenticated, 
    isAdmin, 
    isAdminLoading,
    hasAdminError, 
    adminError, 
    retryAdminCheck,
    adminCheckComplete,
    principalString,
    adminCheckResult,
  } = useAuth();

  const { 
    data: diagnostics, 
    isLoading: diagnosticsLoading,
    refetch: refetchDiagnostics 
  } = useAdminDiagnostics();

  const handleRetry = async () => {
    await retryAdminCheck();
    await refetchDiagnostics();
  };

  // First gate: password verification (always required on every visit)
  if (!passwordVerified) {
    return <AdminRoutePasswordGate onSuccess={() => setPasswordVerified(true)} />;
  }

  // After password verification, proceed with existing authentication/authorization flow

  // Show loading while checking authentication and authorization (admin-specific)
  if (isAdminLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Login with Internet Identity to access admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginButton />
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate({ to: '/' })}
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error UI if authorization check failed
  if (hasAdminError) {
    return (
      <AuthGateErrorCard
        role="admin"
        error={adminError}
        onRetry={handleRetry}
        principalString={principalString}
        adminCheckResult={adminCheckResult}
        diagnostics={diagnostics}
      />
    );
  }

  // Wait for admin check to complete before showing access denied
  // This prevents flashing the access denied screen while the check is in progress
  if (!adminCheckComplete) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin check complete - show dashboard if admin, otherwise access denied
  if (isAdmin) {
    return <AdminDashboardPage />;
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <AccessDeniedScreen 
        role="admin" 
        principalString={principalString}
        adminCheckResult={adminCheckResult}
        diagnostics={diagnostics}
        onRetry={handleRetry}
      />
    </div>
  );
}
