"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserCompanyProfile } from "@/mutations/user-mutation";

export function CompanyProfile({ userId }) {
  const { data: companyProfile, isLoading } = useGetUserCompanyProfile(userId);

  if (isLoading) return <CompanyProfileSkeleton />;

  if (!companyProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No company profile found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Company Name
          </p>
          <p className="text-base font-medium">{companyProfile.company_name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            GST Number
          </p>
          <p className="text-base font-medium">
            {companyProfile.company_gst || "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Company Type
          </p>
          <p className="text-base font-medium">
            {companyProfile.company_type || "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Year of Establishment
          </p>
          <p className="text-base font-medium">
            {companyProfile.year_of_establishment || "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Turnover</p>
          <p className="text-base font-medium">
            {companyProfile.turnover || "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Website</p>
          <p className="text-base font-medium">
            {companyProfile.website_link ? (
              <a
                href={companyProfile.website_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {companyProfile.website_link}
              </a>
            ) : (
              "—"
            )}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Business Types
        </p>
        <Badge>{companyProfile.business_types}</Badge>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Operating Locations
        </p>
        <Badge>{companyProfile.operating_locations}</Badge>
      </div>
    </div>
  );
}

function CompanyProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
