import { Suspense } from "react";
import { serialize, searchParamsCache } from "@/lib/searchparams";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { Heading } from "@/components/ui/heading";
import PageContainer from "@/components/layout/page-container";
import Listing from "./_components/listing";
import TableActions from "./_components/table-actions";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Enquiries",
};

export default async function Enquiries({ searchParams }) {
  searchParamsCache.parse(await searchParams);
  const key = serialize({ ...(await searchParams) });

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title={"Walk In Enquiries"}
          description={"Manage Walk In Enquiries (View, Delete)."}
        />
        <Link
          href={"/walkin-enquiries/create?t=walk-in"}
          className={buttonVariants({ size: "sm" })}
        >
          <Plus /> Create
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
