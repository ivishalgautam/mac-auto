import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Users, MessageSquare, Clock } from "lucide-react";

export default function KeyMetrics({ dashboardData }) {
  const totalUsers = dashboardData.users_by_role.datasets[0].data.reduce(
    (a, b) => a + b,
    0,
  );
  const totalEnquiries =
    dashboardData.enquiries_over_time.datasets[0].data.reduce(
      (a, b) => a + b,
      0,
    );
  const pendingTickets = dashboardData.ticket_status_breakdown.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-muted-foreground text-xs">
            {dashboardData.users_by_role.datasets[0].data[0]} customers,{" "}
            {dashboardData.users_by_role.datasets[0].data[1]} dealers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
          <MessageSquare className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEnquiries}</div>
          <p className="text-muted-foreground text-xs">This week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingTickets}</div>
          <p className="text-muted-foreground text-xs">Awaiting assignment</p>
        </CardContent>
      </Card>
    </div>
  );
}
