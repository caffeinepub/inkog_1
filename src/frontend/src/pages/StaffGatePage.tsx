import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginButton from '../components/auth/LoginButton';
import StaffDashboardPage from './StaffDashboardPage';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import AuthGateErrorCard from '../components/auth/AuthGateErrorCard';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function StaffGatePage() {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    isStaff, 
    isLoading, 
    hasStaffError, 
    staffError, 
    retryStaffCheck,
    staffCheckComplete,
    staffAccount 
  } = useAuth();

  // Show loading while checking authentication and authorization
  if (isLoading) {
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
            <CardTitle>Staff Login</CardTitle>
            <CardDescription>
              Login with Internet Identity to access staff portal
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
  if (hasStaffError) {
    return (
      <AuthGateErrorCard
        role="staff"
        error={staffError}
        onRetry={() => retryStaffCheck()}
      />
    );
  }

  // Wait for staff check to complete before showing access denied
  if (!staffCheckComplete) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if staff account exists and is enabled
  if (isStaff && staffAccount) {
    if (!staffAccount.enabled) {
      return (
        <div className="container mx-auto px-4 py-16 max-w-md">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle>Account Disabled</CardTitle>
              <CardDescription>
                Your staff account has been disabled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please contact your administrator for assistance.
              </p>
              <Button className="w-full" onClick={() => navigate({ to: '/' })}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return <StaffDashboardPage />;
  }

  return <AccessDeniedScreen role="staff" />;
}
