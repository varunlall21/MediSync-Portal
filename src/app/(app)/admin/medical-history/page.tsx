
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function AdminMedicalHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Patient Medical Records (Read-Only)</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" /> Medical Records Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Admins can view patient medical history here. Access is read-only.</p>
           <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
            Patient medical records will be displayed here in a secure, read-only format.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
