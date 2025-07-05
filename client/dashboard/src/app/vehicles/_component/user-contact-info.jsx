"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserContacts } from "@/mutations/user-mutation";

export function ContactInformation({ userId }) {
  const { data: contacts, isLoading } = useGetUserContacts(userId);

  if (isLoading) {
    return <ContactInformationSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Contact Persons</h3>

      {contacts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Name
                    </p>
                    <p className="text-base font-medium">
                      {contact.person_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Designation
                    </p>
                    <p className="text-base font-medium">
                      {contact.designation || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-base font-medium">
                      {contact.email || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Contact Number
                    </p>
                    <p className="text-base font-medium">
                      {contact.contact_number || "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No contacts found.</p>
          <Button variant="link" className="mt-2">
            Add your first contact
          </Button>
        </div>
      )}
    </div>
  );
}

function ContactInformationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array(4)
                    .fill(0)
                    .map((_, j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
