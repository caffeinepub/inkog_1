import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUpdateReportStatus } from '../../hooks/useStaffReports';
import { Report, ReportStatus } from '../../backend';
import { MoreVertical, CheckCircle, Eye } from 'lucide-react';

interface ReportStatusActionsProps {
  report: Report;
}

export default function ReportStatusActions({ report }: ReportStatusActionsProps) {
  const updateStatus = useUpdateReportStatus();

  const handleStatusChange = async (status: ReportStatus) => {
    await updateStatus.mutateAsync({
      reportId: report.id,
      status,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={updateStatus.isPending}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {report.status !== ReportStatus.reviewed && (
          <DropdownMenuItem onClick={() => handleStatusChange(ReportStatus.reviewed)}>
            <Eye className="h-4 w-4 mr-2" />
            Mark as Reviewed
          </DropdownMenuItem>
        )}
        {report.status !== ReportStatus.resolved && (
          <DropdownMenuItem onClick={() => handleStatusChange(ReportStatus.resolved)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Resolved
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
