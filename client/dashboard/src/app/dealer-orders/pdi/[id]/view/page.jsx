"use client";
import PDICheckForm from "@/components/forms/pdi-check-form";
import { useParams } from "next/navigation";

export default function PDIViewPage() {
  const { id } = useParams();

  return <PDICheckForm id={id} type="view" />;
}
