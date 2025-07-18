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

export const metadata = {
  title: "Users",
};

export default async function Users({ searchParams }) {
  const sParams = await searchParams;

  searchParamsCache.parse(sParams);
  const key = serialize({ ...sParams });

  return (
    <PageContainer>
      <div className="flex items-start justify-between">
        <Heading
          title="Users"
          description="Manage users (Create, Update, Delete)."
        />
        <Link href="/users/create" className={buttonVariants({ size: "sm" })}>
          <Plus size="15" /> Add User
        </Link>
      </div>
      <UserTableActions />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
      >
        <UserListing />
      </Suspense>
    </PageContainer>
  );
}
