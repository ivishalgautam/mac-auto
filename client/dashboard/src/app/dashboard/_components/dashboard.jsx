"use client";

import { Heading } from "@/components/ui/heading";
import ChartSection from "./chart-section";
import EnquiryTable from "./enquiry-table";
import KeyMetrics from "./key-metrics";

export default function Dashboard({ dashboardData }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="">
        <div className="">
          <div className="flex items-center justify-between">
            <div>
              <Heading
                title={"Dashboard"}
                description={"Vehicle management system"}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-4 py-4">
        {/* Key Metrics */}
        <KeyMetrics dashboardData={dashboardData} />

        {/* Charts Section */}
        <ChartSection dashboardData={dashboardData} />

        {/* Recent Enquiries Table */}
        <EnquiryTable dashboardData={dashboardData} />
      </div>
    </div>
  );
}
