import React from "react";
import OrderStepperForm from "../../../../components/forms/order-stepper-form";

export default async function Page({ params }) {
  const { id } = await params;
  return <OrderStepperForm type={"edit"} id={id} />;
}
