import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Listing from "./_component/listing";
import TableActions from "./_component/table-actions";

export const metadata = {
  title: "Tickets",
};

export default async function TicketsPage({ searchParams }) {
  const sParams = await searchParams;

  searchParamsCache.parse(sParams);
  const key = serialize({ ...sParams });

  return (
    <PageContainer>
      <div className="flex items-start justify-between">
        <Heading
          title="Tickets"
          description="Manage Tickets (Create, Update, Delete)."
        />
        <Link href="/tickets/create" className={buttonVariants({ size: "sm" })}>
          <Plus size="15" />
          Add ticket
        </Link>
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
