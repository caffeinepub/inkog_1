import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { MessageSquare, Users, Settings } from 'lucide-react';

export default function EntryPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Welcome to Inkog</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A safe, anonymous platform for reporting concerns. Choose your role below to continue.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => navigate({ to: '/student' })}>
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Student</CardTitle>
            <CardDescription>Submit an anonymous report</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              No login required. Your identity is completely protected.
            </p>
            <Button className="w-full" onClick={() => navigate({ to: '/student' })}>
              Submit Report
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => navigate({ to: '/staff' })}>
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <CardTitle>Staff / Counsellor</CardTitle>
            <CardDescription>View and manage reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Secure login required. Access reports from your school.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => navigate({ to: '/staff' })}>
              Staff Login
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => navigate({ to: '/admin' })}>
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Admin</CardTitle>
            <CardDescription>Platform management</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage schools, staff accounts, and view statistics.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate({ to: '/admin' })}>
              Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 bg-card border border-border rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Privacy & Safety First</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="font-medium mb-2">100% Anonymous</h4>
            <p className="text-sm text-muted-foreground">
              No personal information is collected or stored
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">🛡️</div>
            <h4 className="font-medium mb-2">Secure Platform</h4>
            <p className="text-sm text-muted-foreground">
              Built on blockchain technology for maximum security
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">✅</div>
            <h4 className="font-medium mb-2">Trusted by Schools</h4>
            <p className="text-sm text-muted-foreground">
              Helping create safer learning environments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
