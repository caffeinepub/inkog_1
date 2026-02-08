import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubmitReport } from '../hooks/useStudentReport';
import { useGetSchools } from '../hooks/useSchools';
import { ReportCategory } from '../backend';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function StudentReportPage() {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState<string>('');
  const [category, setCategory] = useState<ReportCategory>(ReportCategory.other);
  const [text, setText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: schools, isLoading: schoolsLoading } = useGetSchools();
  const submitReport = useSubmitReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId || !text.trim()) {
      return;
    }

    try {
      await submitReport.mutateAsync({
        schoolId: BigInt(schoolId),
        category,
        text: text.trim(),
      });
      
      setShowSuccess(true);
      setText('');
      setSchoolId('');
      setCategory(ReportCategory.other);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 8000);
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const categoryLabels: Record<ReportCategory, string> = {
    [ReportCategory.bullying]: 'Bullying',
    [ReportCategory.harassment]: 'Harassment',
    [ReportCategory.mentalHealth]: 'Mental Health',
    [ReportCategory.suggestion]: 'Suggestion',
    [ReportCategory.other]: 'Other',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate({ to: '/' })}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Submit Anonymous Report</CardTitle>
          <CardDescription>
            Your identity is completely protected. No personal information is collected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSuccess ? (
            <Alert className="bg-primary/10 border-primary">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <AlertDescription className="text-base ml-2">
                Your report has been submitted anonymously
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="school">Select Your School *</Label>
                <Select value={schoolId} onValueChange={setSchoolId} disabled={schoolsLoading}>
                  <SelectTrigger id="school">
                    <SelectValue placeholder={schoolsLoading ? 'Loading schools...' : 'Choose your school'} />
                  </SelectTrigger>
                  <SelectContent>
                    {schools?.map((school) => (
                      <SelectItem key={school.id.toString()} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as ReportCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report">Your Report *</Label>
                <Textarea
                  id="report"
                  placeholder="Describe your concern in detail. Remember, this is completely anonymous."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] resize-y"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {text.length} characters
                </p>
              </div>

              {submitReport.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to submit report. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Privacy Notice:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>No name, email, or phone number is collected</li>
                  <li>Your IP address is not stored</li>
                  <li>Reports are reviewed by school staff only</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!schoolId || !text.trim() || submitReport.isPending}
              >
                {submitReport.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report Anonymously'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
