import { Badge } from "@/components/ui/badge";

export function UserProfile({ user }) {
  const userDetails = [
    { label: "Username", value: user.username },
    { label: "Email", value: user.email },
    { label: "Mobile Number", value: user.mobile_number },
    { label: "First Name", value: user.first_name || "—" },
    { label: "Last Name", value: user.last_name || "—" },
    {
      label: "Member Since",
      value: new Date(user.created_at).toLocaleDateString(),
    },
    // {
    //   label: "Last Updated",
    //   value: new Date(user.updated_at).toLocaleDateString(),
    // },
    {
      label: "Status",
      value: (
        <Badge variant={user.is_active ? "default" : "destructive"}>
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      label: "Role",
      value: (
        <Badge variant="secondary" className="capitalize">
          {user.role}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userDetails.map((detail, index) => (
          <div key={index} className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">
              {detail.label}
            </div>
            <div className="text-base font-medium">{detail.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
