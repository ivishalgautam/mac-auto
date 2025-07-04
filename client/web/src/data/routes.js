import { User } from "lucide-react";

const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export const allRoutes = [
  {
    link: "/",
    roles: [],
  },
  {
    label: "Profile",
    link: "/dashboard",
    roles: [ROLES.USER],
    icon: User,
  },
];
