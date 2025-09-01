"use client";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import dynamic from "next/dynamic";
const MarketingMaterials = dynamic(
  () => import("./_components/marketing-materials"),
  { ssr: false },
);
const OrderBrochureDialog = dynamic(
  () => import("./_components/order-brochure-dialog"),
  { ssr: false },
);
import { Suspense } from "react";

export default async function MarketingMaterialsPage({}) {
  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title={"Marketing materials"}
          description={"Download marketing materials."}
        />
      </div>
      <Suspense>
        <OrderBrochureDialog />
      </Suspense>
      <Suspense>
        <MarketingMaterials />
      </Suspense>
    </PageContainer>
  );
}
