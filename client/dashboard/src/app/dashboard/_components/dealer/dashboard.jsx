"use client";

import { Heading } from "@/components/ui/heading";
import KeyMetrics from "./key-metrics";
import EnquiryTable from "./enquiry-table";
import TodaySchemes from "./schemes";
import { H3 } from "@/components/ui/typography";
import { useGetVehicles } from "@/mutations/vehicle-mutation";
import Inventory from "./inventory";
import { VehicleLaunchCard } from "./vehicle-launch-card";

export default function DealerDashboard({ dashboardData }) {
  const { data, isLoading, isError, error } = useGetVehicles("page=1&limit=1");

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
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-2">
            <H3>Schemes</H3>
            {dashboardData.today_schemes?.length === 0 ? (
              "No schemes found today"
            ) : (
              <TodaySchemes dashboardData={dashboardData} />
            )}
          </div>
          <div className="col-span-4 space-y-4">
            <div className="space-y-2">
              <H3>New Model launch</H3>
              {data?.vehicles?.map((item) => {
                return (
                  <VehicleLaunchCard
                    key={item.id}
                    launchDate={item.created_at}
                    title={item.title}
                    description={item.description}
                    subtitle={item.category}
                    imageUrl={item.carousel[0]}
                  />
                );
              })}
            </div>
            <div className="space-y-2">
              <H3>Inventory</H3>
              <Inventory />
            </div>
          </div>
        </div>

        {/* Recent Enquiries Table */}
        <EnquiryTable dashboardData={dashboardData} />
      </div>
    </div>
  );
}
