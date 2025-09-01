import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import MarketingMaterials from "./_components/marketing-materials";
import OrderBrochureDialog from "./_components/order-brochure-dialog";

export default async function MarketingMaterialsPage({}) {
  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title={"Marketing materials"}
          description={"Download marketing materials."}
        />
      </div>
      <OrderBrochureDialog />
      <MarketingMaterials />
    </PageContainer>
  );
}
