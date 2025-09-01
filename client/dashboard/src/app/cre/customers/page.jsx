import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";
import UserListing from "./_component/listing";
import UserTableActions from "./_component/table-actions";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Listing from "./_component/listing";

export const metadata = {
  title: "Customers",
};

export default async function Customers({ searchParams }) {
  const sParams = await searchParams;

  searchParamsCache.parse(sParams);
  const key = serialize({ ...sParams });

  return (
    <PageContainer>
      <div className="flex items-start justify-between">
        <Heading
          title="Customers"
          description="Manage customers (Create, Update, Delete)."
        />
      </div>
      <UserTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <Listing />
      </Suspense>
    </PageContainer>
  );
}
