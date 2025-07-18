import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import {
  CarFront,
  Handshake,
  LayoutDashboard,
  ScrollText,
  User,
  Users,
} from "lucide-react";

const ROLES = {
  ADMIN: "admin",
  USER: "user",
  DEALER: "dealer",
};

export const sidebarData = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN, ROLES.DEALER],
    isVisible: true,
    items: [],
  },
  {
    title: "User",
    url: "/users?page=1&limit=10",
    icon: Users,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/users/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/users/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },
  {
    title: "Financers",
    url: "/financers?page=1&limit=10",
    icon: Handshake,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/financers/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/financers/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },
  {
    title: "Vehicles",
    url: "/vehicles?page=1&limit=10",
    icon: CarFront,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/vehicles/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/vehicles/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
      {
        title: "Inventory",
        url: "/vehicles/:id/inventory?page=1&limit=10",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },
  {
    title: "Inventory",
    url: "/dealer-inventory?page=1&limit=10",
    icon: CarFront,
    roles: [ROLES.DEALER],
    isVisible: true,
    items: [],
  },
  {
    title: "Enquiries",
    url: "/enquiries?page=1&limit=10",
    icon: ScrollText,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [],
  },
  {
    title: "Orders",
    url: "/dealer-orders?page=1&limit=10",
    icon: Handshake,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [
      {
        title: "Create",
        url: "/dealer-orders/create",
        roles: [ROLES.ADMIN],
        isVisible: true,
      },
      {
        title: "Edit",
        url: "/dealer-orders/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
    ],
  },
  {
    title: "Queries",
    url: "/queries?page=1&limit=10",
    icon: QuestionMarkCircledIcon,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [],
  },
  {
    title: "Profile Overview",
    url: "/profile",
    icon: User,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [],
  },
];

export const publicRoutes = ["/", "/admin", "/register"];
