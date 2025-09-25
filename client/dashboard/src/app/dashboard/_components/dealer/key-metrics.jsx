import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Users, MessageSquare, Clock } from "lucide-react";

export default function KeyMetrics({ dashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboardData.customer_count}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
          <MessageSquare className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboardData.enquiries?.reduce(
              (acc, curr) => parseInt(acc.count) + parseInt(curr.count),
            )}
          </div>
          <p className="text-muted-foreground space-x-2 text-xs uppercase">
            {dashboardData.enquiries?.map((e, ind) => (
              <span key={ind}>
                {e.enquiry_type.split("-").join(" ")}: {e.count}
              </span>
            ))}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboardData.customer_tickets + dashboardData.dealer_tickets}
          </div>
          <p className="text-muted-foreground text-xs">
            Customer tickets: {dashboardData.customer_tickets}, My tickets:{" "}
            {dashboardData.dealer_tickets}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
