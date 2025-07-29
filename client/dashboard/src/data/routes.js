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
        title: "Customers",
        url: "/users/customers?page=1&limit=10",
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
    title: "Customers",
    url: "/customers?page=1&limit=10",
    roles: [ROLES.DEALER],
    isVisible: true,
    icon: Users,
    items: [],
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
    items: [
      {
        title: "Inventory",
        url: "/dealer-inventory/:id/inventory?page=1&limit=10",
        roles: [ROLES.DEALER],
        isVisible: false,
      },
    ],
  },
  {
    title: "Vehicles Enquiries",
    url: "/vehicle-enquiries?page=1&limit=10",
    icon: ScrollText,
    roles: [ROLES.ADMIN],
    isVisible: true,
    items: [],
  },
  {
    title: "Vehicles",
    url: "/vehicle-listing?page=1&limit=10",
    icon: ScrollText,
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
    roles: [ROLES.ADMIN, ROLES.DEALER],
    isVisible: true,
    items: [
      {
        title: "Edit",
        url: "/dealer-orders/:id/edit",
        roles: [ROLES.ADMIN],
        isVisible: false,
      },
      {
        title: "PDI Add",
        url: "/dealer-orders/:id/pdi/add",
        roles: [ROLES.ADMIN, ROLES.DEALER],
        isVisible: false,
      },
      {
        title: "PDI View",
        url: "/dealer-orders/pdi/:id/view",
        roles: [ROLES.ADMIN, ROLES.DEALER],
        isVisible: false,
      },
      {
        title: "PDI edit",
        url: "/dealer-orders/pdi/:id/edit",
        roles: [ROLES.ADMIN, ROLES.DEALER],
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
