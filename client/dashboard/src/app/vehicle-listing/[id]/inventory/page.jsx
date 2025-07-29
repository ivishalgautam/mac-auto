import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";
import UserTableActions from "./_component/table-actions";
import Listing from "./_component/listing";

export const metadata = {
  title: "Vehicle Inventory",
};

export default async function VehicleInventoryPage({ searchParams, params }) {
  const sParams = await searchParams;
  const { id } = await params;
  searchParamsCache.parse(sParams);
  const key = serialize({ ...sParams });

  return (
    <PageContainer>
      <div className="flex items-start justify-between">
        <Heading
          title="Vehicle Inventory"
          description="Manage Vehicle Inventory (Create, Update, Delete)."
        />
        {/* <Link
          href="/vehicleInventory/create"
          className={buttonVariants({ size: "sm" })}
        >
          <Plus size="15" /> Add Vehicle
        </Link> */}
      </div>
      <UserTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <Listing vehicleId={id} />
      </Suspense>
    </PageContainer>
  );
}
