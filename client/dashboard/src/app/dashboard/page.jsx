"use client";
import { useGetReports } from "@/mutations/report-mutation";
import React from "react";
import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";
import AdminDashboard from "./_components/admin/dashboard";
import { useAuth } from "@/providers/auth-provider";
import DealerDashboard from "./_components/dealer/dashboard";

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useGetReports();
  const { user } = useAuth();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
      {user?.role === "admin" && <AdminDashboard dashboardData={data} />}
      {user?.role === "dealer" && <DealerDashboard dashboardData={data} />}
    </div>
  );
}
