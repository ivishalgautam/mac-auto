import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Mail, MapPin, Phone } from "lucide-react";

const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      );
    case "dealer assigned":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Dealer Assigned
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function EnquiryTable({ dashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Enquiries</CardTitle>
        <CardDescription>
          Latest vehicle enquiries and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dealership</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardData.latest_enquiries.map((enquiry) => (
              <TableRow key={enquiry.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium">{enquiry.name}</div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {enquiry.email}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3" />
                      {enquiry.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Car className="text-muted-foreground h-4 w-4" />
                    <div>
                      <div className="font-medium">{enquiry.vehicle_title}</div>
                      <div className="text-muted-foreground text-sm">
                        Qty: {enquiry.quantity}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground h-3 w-3" />
                    {enquiry.location}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">{enquiry.dealership}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(enquiry.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
