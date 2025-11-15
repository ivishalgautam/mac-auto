import OrderItemDetailsFOrm from "@/components/forms/order-item-details-form";

export default async function Page({ searchParams }) {
  const { id } = await searchParams;
  return <OrderItemDetailsFOrm type="view" id={id} />;
}
