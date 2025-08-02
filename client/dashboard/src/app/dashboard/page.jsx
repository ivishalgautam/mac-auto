"use client";
import { useGetReports } from "@/mutations/report-mutation";
import React from "react";
import Dashboard from "./_components/dashboard";
import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useGetReports();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
      <Dashboard dashboardData={data} />
    </div>
  );
}
