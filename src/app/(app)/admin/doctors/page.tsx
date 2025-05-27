
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, UserPlus } from "lucide-react";

export default function ManageDoctorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Doctors</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Add New Doctor
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Stethoscope className="mr-2 h-5 w-5 text-primary" /> Doctor List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Doctor management interface will be here. Admins can edit doctor details and assign specialties.</p>
          {/* Placeholder for table or list of doctors */}
          <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
            Doctor data will be displayed here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
