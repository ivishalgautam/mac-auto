import { Suspense } from "react";
import { serialize, searchParamsCache } from "@/lib/searchparams";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { Heading } from "@/components/ui/heading";
import PageContainer from "@/components/layout/page-container";
import Listing from "./_components/listing";
import TableActions from "./_components/table-actions";

export const metadata = {
  title: "Vehicle Enquiries",
};

export default async function VehicleEnquiriesPage({ searchParams }) {
  const searchParamsStr = await searchParams;

  searchParamsCache.parse(searchParamsStr);
  const key = serialize({ ...searchParamsStr });

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title={"Vehicle Enquiries"}
          description={"Manage Vehicle Enquiries (View, Delete)."}
        />
      </div>
      <TableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <Listing />
      </Suspense>
    </PageContainer>
  );
}
