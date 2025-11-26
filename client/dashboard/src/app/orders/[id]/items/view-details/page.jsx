import OrderItemDetailsForm from "@/components/forms/order-item-details-form";

export default async function Page({ searchParams }) {
  const { id } = await searchParams;
  return <OrderItemDetailsForm type="view" id={id} />;
}
