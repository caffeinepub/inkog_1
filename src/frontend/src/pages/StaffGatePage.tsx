import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from '../components/auth/LoginButton';
import StaffDashboardPage from './StaffDashboardPage';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function StaffGatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isStaff, isLoading, staffAccount } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && !isStaff) {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, isLoading, isStaff]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Staff Login</CardTitle>
            <CardDescription>
              Login with Internet Identity to access your school's reports
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

  if (!isStaff || !staffAccount) {
    return <AccessDeniedScreen role="staff" />;
  }

  return <StaffDashboardPage />;
}
