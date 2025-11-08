import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Suspense } from "react";
import Listing from "./_component/listing";
import TableActions from "./_component/table-actions";

export const metadata = {
  title: "Orders items",
};

export default async function OrderItems({ searchParams, params }) {
  searchParamsCache.parse(await searchParams);
  const { id } = await params;
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-2">
        <Heading
          title="Order items"
          description="Manage order items (Create, Update, Delete)."
        />
        {/* <Link
          href={"/orders/create"}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <Plus /> Add
        </Link> */}
      </div>
      <TableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <Listing orderId={id} />
      </Suspense>
    </PageContainer>
  );
}
