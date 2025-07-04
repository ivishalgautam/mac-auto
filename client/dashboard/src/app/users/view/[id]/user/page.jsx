"use client";
import { CompanyProfile } from "@/app/users/_component/user-company-profile";
import { ContactInformation } from "@/app/users/_component/user-contact-info";
import { UserProfile } from "@/app/users/_component/user-profile";
import PageContainer from "@/components/layout/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetUserProfile } from "@/mutations/user-mutation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function UserViewPage({ params: { id } }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const activeTab = params.get("tab") ?? "profile";

  const { data: user, isLoading } = useGetUserProfile(id);
  if (isLoading) return "Loading...";

  return (
    <PageContainer>
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="profile"
            onClick={() => router.replace(`${pathname}?tab=profile`)}
          >
            User Profile
          </TabsTrigger>
          <TabsTrigger
            value="company"
            onClick={() => router.replace(`${pathname}?tab=company`)}
          >
            Company Profile
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            onClick={() => router.replace(`${pathname}?tab=contacts`)}
          >
            Contact Information
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                View and manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfile user={user} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>
                View and manage your company details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyProfile userId={id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                View and manage your contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactInformation userId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
