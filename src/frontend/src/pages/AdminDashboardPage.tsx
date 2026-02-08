import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import LoginButton from '../components/auth/LoginButton';
import SchoolFormDialog from '../components/admin/SchoolFormDialog';
import StaffFormDialog from '../components/admin/StaffFormDialog';
import { useGetSchools, useDeleteSchool } from '../hooks/useAdmin';
import { useGetAllStaff, useDeleteStaff } from '../hooks/useAdmin';
import { useGetSchoolStats } from '../hooks/useAdmin';
import { School, StaffAccount } from '../backend';
import { Loader2, Plus, Pencil, Trash2, Building2, Users, BarChart3 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminDashboardPage() {
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [deleteSchoolId, setDeleteSchoolId] = useState<bigint | null>(null);
  const [deleteStaffId, setDeleteStaffId] = useState<bigint | null>(null);

  const { data: schools, isLoading: schoolsLoading } = useGetSchools();
  const { data: staff, isLoading: staffLoading } = useGetAllStaff();
  const { data: stats, isLoading: statsLoading } = useGetSchoolStats();
  const deleteSchool = useDeleteSchool();
  const deleteStaff = useDeleteStaff();

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setSchoolDialogOpen(true);
  };

  const handleEditStaff = (staffMember: StaffAccount) => {
    setEditingStaff(staffMember);
    setStaffDialogOpen(true);
  };

  const handleDeleteSchool = async () => {
    if (deleteSchoolId) {
      await deleteSchool.mutateAsync(deleteSchoolId);
      setDeleteSchoolId(null);
    }
  };

  const handleDeleteStaff = async () => {
    if (deleteStaffId) {
      await deleteStaff.mutateAsync(deleteStaffId);
      setDeleteStaffId(null);
    }
  };

  const getSchoolName = (schoolId: bigint) => {
    return schools?.find((s) => s.id === schoolId)?.name || 'Unknown';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-1">Platform management and statistics</p>
        </div>
        <LoginButton />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="schools">
            <Building2 className="h-4 w-4 mr-2" />
            Schools
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="h-4 w-4 mr-2" />
            Staff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{schools?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{staff?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.reduce((sum, s) => sum + Number(s.totalReports), 0) || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reports by School</CardTitle>
              <CardDescription>Overview of report activity across all schools</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : stats && stats.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead className="text-right">Total Reports</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.map((stat) => (
                        <TableRow key={stat.schoolId.toString()}>
                          <TableCell className="font-medium">{stat.schoolName}</TableCell>
                          <TableCell className="text-right">{stat.totalReports.toString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Schools</CardTitle>
                  <CardDescription>Manage schools in the platform</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingSchool(null);
                    setSchoolDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add School
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {schoolsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : schools && schools.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schools.map((school) => (
                        <TableRow key={school.id.toString()}>
                          <TableCell className="font-medium">{school.name}</TableCell>
                          <TableCell>{school.address}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSchool(school)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteSchoolId(school.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No schools yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Accounts</CardTitle>
                  <CardDescription>Manage staff and counsellor accounts</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingStaff(null);
                    setStaffDialogOpen(true);
                  }}
                  disabled={!schools || schools.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {staffLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : staff && staff.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((staffMember) => (
                        <TableRow key={staffMember.id.toString()}>
                          <TableCell className="font-medium">{staffMember.name}</TableCell>
                          <TableCell>{staffMember.email}</TableCell>
                          <TableCell>{getSchoolName(staffMember.schoolId)}</TableCell>
                          <TableCell>
                            <Badge variant={staffMember.enabled ? 'default' : 'secondary'}>
                              {staffMember.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStaff(staffMember)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteStaffId(staffMember.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No staff accounts yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SchoolFormDialog
        open={schoolDialogOpen}
        onOpenChange={setSchoolDialogOpen}
        school={editingSchool}
        onSuccess={() => {
          setSchoolDialogOpen(false);
          setEditingSchool(null);
        }}
      />

      <StaffFormDialog
        open={staffDialogOpen}
        onOpenChange={setStaffDialogOpen}
        staff={editingStaff}
        schools={schools || []}
        onSuccess={() => {
          setStaffDialogOpen(false);
          setEditingStaff(null);
        }}
      />

      <AlertDialog open={!!deleteSchoolId} onOpenChange={() => setDeleteSchoolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this school? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSchool}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteStaffId} onOpenChange={() => setDeleteStaffId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this staff account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
