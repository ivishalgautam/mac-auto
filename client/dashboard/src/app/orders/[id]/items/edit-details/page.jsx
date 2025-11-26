import OrderItemDetailsForm from "@/components/forms/order-item-details-form";

export default async function Page({ searchParams, params }) {
  const { itemId } = await searchParams;
  const { id } = await params;
  return <OrderItemDetailsForm type="edit" id={id} />;
}
