import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginButton from '../components/auth/LoginButton';
import AdminDashboardPage from './AdminDashboardPage';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function AdminGatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

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

  if (!isAdmin) {
    return <AccessDeniedScreen role="admin" />;
  }

  return <AdminDashboardPage />;
}
