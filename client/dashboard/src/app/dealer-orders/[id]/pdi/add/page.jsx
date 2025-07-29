"use client";
import PDICheckForm from "@/components/forms/pdi-check-form";
import { useParams } from "next/navigation";

export default function AddPDIPage() {
  const { id } = useParams();

  return <PDICheckForm orderId={id} />;
}
