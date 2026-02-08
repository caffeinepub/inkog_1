import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../hooks/useAuth';
import { useGetReportsBySchool } from '../hooks/useStaffReports';
import { ReportCategory, ReportStatus, Report } from '../backend';
import ReportStatusActions from '../components/reports/ReportStatusActions';
import LoginButton from '../components/auth/LoginButton';
import ShowPrincipalButton from '../components/auth/ShowPrincipalButton';
import { Loader2, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

export default function StaffDashboardPage() {
  const { staffAccount } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: reports, isLoading } = useGetReportsBySchool(
    staffAccount?.schoolId || BigInt(0)
  );

  const categoryLabels: Record<ReportCategory, string> = {
    [ReportCategory.bullying]: 'Bullying',
    [ReportCategory.harassment]: 'Harassment',
    [ReportCategory.mentalHealth]: 'Mental Health',
    [ReportCategory.suggestion]: 'Suggestion',
    [ReportCategory.other]: 'Other',
  };

  const statusLabels: Record<ReportStatus, string> = {
    [ReportStatus.submitted]: 'Submitted',
    [ReportStatus.reviewed]: 'Reviewed',
    [ReportStatus.resolved]: 'Resolved',
  };

  const statusColors: Record<ReportStatus, string> = {
    [ReportStatus.submitted]: 'bg-accent/20 text-accent-foreground',
    [ReportStatus.reviewed]: 'bg-primary/20 text-primary-foreground',
    [ReportStatus.resolved]: 'bg-muted text-muted-foreground',
  };

  const filteredReports = reports?.filter((report: Report) => {
    if (categoryFilter !== 'all' && report.category !== categoryFilter) {
      return false;
    }
    
    if (startDate) {
      const start = new Date(startDate).getTime() * 1000000;
      if (Number(report.timestamp) < start) return false;
    }
    
    if (endDate) {
      const end = new Date(endDate).getTime() * 1000000 + 86400000000000;
      if (Number(report.timestamp) > end) return false;
    }
    
    return true;
  }).sort((a: Report, b: Report) => Number(b.timestamp) - Number(a.timestamp));

  const clearFilters = () => {
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = categoryFilter !== 'all' || startDate || endDate;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold">Staff Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            {staffAccount?.name} • {staffAccount?.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShowPrincipalButton />
          <LoginButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {reports?.filter((r: Report) => r.status === ReportStatus.submitted).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">
              {reports?.filter((r: Report) => r.status === ReportStatus.resolved).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and manage reports for your school</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredReports && filteredReports.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Report</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report: Report) => (
                    <TableRow key={report.id.toString()}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(Number(report.timestamp) / 1000000), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryLabels[report.category]}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2">{report.text}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[report.status]}>
                          {statusLabels[report.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ReportStatusActions report={report} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {hasActiveFilters ? 'No reports match your filters' : 'No reports yet'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
