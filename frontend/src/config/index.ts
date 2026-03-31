import { Building2, Globe, HardHat, LayoutDashboard, Layers, Map, MapPinned, Settings, Shield, Tags, UserCog, UserCircle, Users, Wrench } from "lucide-react";

export type SidebarItem = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    permission_id: number | boolean;
};

export type SidebarGroup = {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    children: SidebarItem[];
};

export type RoutePermissionRule = {
    path: string;
    permission_id: number | boolean;
};

export type AdminBreadcrumbItem = {
    label: string;
    href?: string;
};

type AdminBreadcrumbRule = {
    path: string;
    startsWith?: boolean;
    items: AdminBreadcrumbItem[];
};

export type ProfileStatus = "pending" | "approved" | "rejected" | "suspended";

/** Indian mobile: optional +91 / leading 0, then 10-digit starting with 6–9. */
export const PHONE_REGEXP = /^(?:(?:\+|0{0,2})91(\s*|[-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/;
export const PHONE_ERROR_MESSAGE = "Enter a valid Indian mobile number.";
export const SERVICE_PROVIDER_PROFILE_STATUSES : ProfileStatus[] = ["pending", "approved", "rejected", "suspended"];

export const PERMISSIONS = [
    {
        name: "General Settings",
        permissions: [
            { id: 100, label: "Application Settings" },
        ]
    },
    {
        name: "Role Management",
        permissions: [
            { id: 101, label: "Create Role" },
            { id: 102, label: "Update Role" },
            { id: 103, label: "Delete Role" },
            { id: 104, label: "View Role" },
            { id: 105, label: "Assign Permission" },
        ]
    },
    {
        name: "Sub Admin Management",
        permissions: [
            { id: 201, label: "Create Admin" },
            { id: 202, label: "Update Admin" },
            { id: 203, label: "Delete Admin" },
            { id: 204, label: "View Admin" },
            { id: 205, label: "Assign Permission" },
        ]
    },
    {
        name: "Country Management",
        permissions: [
            { id: 301, label: "Create Country" },
            { id: 302, label: "Update Country" },
            { id: 303, label: "Delete Country" },
            { id: 304, label: "View Country" },
        ]
    },
    {
        name: "State Management",
        permissions: [
            { id: 311, label: "Create State" },
            { id: 312, label: "Update State" },
            { id: 313, label: "Delete State" },
            { id: 314, label: "View State" },
        ]
    },
    {
        name: "City Management",
        permissions: [
            { id: 321, label: "Create City" },
            { id: 322, label: "Update City" },
            { id: 323, label: "Delete City" },
            { id: 324, label: "View City" },
        ]
    },
    {
        name: "Customer Management",
        permissions: [
            { id: 331, label: "Create Customer" },
            { id: 332, label: "Update Customer" },
            { id: 333, label: "Delete Customer" },
            { id: 334, label: "View Customer" },
        ]
    },
    {
        name: "Rating Tags",
        permissions: [
            { id: 341, label: "Create Rating tag" },
            { id: 342, label: "Update Rating tag" },
            { id: 343, label: "Delete Rating tag" },
            { id: 344, label: "View Rating Tags" },
        ]
    },
    {
        name: "Service Category",
        permissions: [
            { id: 351, label: "Create Service category" },
            { id: 352, label: "Update Service category" },
            { id: 353, label: "Delete Service category" },
            { id: 354, label: "View Service Categories" },
        ]
    },
    {
        name: "Service Type",
        permissions: [
            { id: 361, label: "Create Service type" },
            { id: 362, label: "Update Service type" },
            { id: 363, label: "Delete Service type" },
            { id: 364, label: "View Service types" },
        ]
    },
    {
        name: "Service Provider",
        permissions: [
            { id: 371, label: "Create Service provider" },
            { id: 372, label: "Update Service provider" },
            { id: 373, label: "Delete Service provider" },
            { id: 374, label: "View Service providers" },
        ]
    },

];

export const MENU: Array<SidebarItem | SidebarGroup> = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, permission_id: true },
    {
        label: "User Management",
        icon: Shield,
        children: [
            { href: "/admin/roles", label: "Roles", icon: UserCog, permission_id: 104 },
            { href: "/admin/admins", label: "Sub Admins", icon: Users, permission_id: 204 },
            { href: "/admin/customers", label: "Customers", icon: UserCircle, permission_id: 334 },
            { href: "/admin/service-providers", label: "Service providers", icon: HardHat, permission_id: 374 },
        ]
    },
    {
        label: "Master",
        icon: Tags,
        children: [
            { href: "/admin/rating-tags", label: "Rating Tags", icon: Tags, permission_id: 344 },
            { href: "/admin/service-categories", label: "Service Categories", icon: Layers, permission_id: 354 },
            { href: "/admin/service-types", label: "Service types", icon: Wrench, permission_id: 364 },
        ]
    },
    {
        label: "Location Management",
        icon: MapPinned,
        children: [
            { href: "/admin/countries", label: "Countries", icon: Globe, permission_id: 304 },
            { href: "/admin/states", label: "States", icon: Map, permission_id: 314 },
            { href: "/admin/cities", label: "Cities", icon: Building2, permission_id: 324 },
        ]
    },
    { href: "/admin/settings", label: "Settings", icon: Settings, permission_id: 100 },
];

export const ADMIN_ROUTE_PERMISSIONS: RoutePermissionRule[] = [
    { path: "/admin/roles/permissions", permission_id: 105 },
    { path: "/admin/admins/permissions", permission_id: 205 },
    { path: "/admin/settings", permission_id: 100 },
    { path: "/admin/roles", permission_id: 104 },
    { path: "/admin/admins", permission_id: 204 },
    { path: "/admin/countries", permission_id: 304 },
    { path: "/admin/states", permission_id: 314 },
    { path: "/admin/cities", permission_id: 324 },
    { path: "/admin/customers", permission_id: 334 },
    { path: "/admin/service-providers", permission_id: 374 },
    { path: "/admin/rating-tags", permission_id: 344 },
    { path: "/admin/service-categories", permission_id: 354 },
    { path: "/admin/service-types", permission_id: 364 },
];

export const ADMIN_BREADCRUMB_ROUTES: AdminBreadcrumbRule[] = [
    { path: "/admin/dashboard", items: [{ label: "Dashboard" }] },
    { path: "/admin/roles", items: [{ label: "Roles" }] },
    { path: "/admin/admins", items: [{ label: "Sub Admins" }] },
    { path: "/admin/settings", items: [{ label: "Settings" }] },
    { path: "/admin/countries", items: [{ label: "Countries" }] },
    { path: "/admin/states", items: [{ label: "States" }] },
    { path: "/admin/cities", items: [{ label: "Cities" }] },
    { path: "/admin/customers", items: [{ label: "Customers" }] },
    { path: "/admin/service-providers", items: [{ label: "Service providers" }] },
    { path: "/admin/rating-tags", items: [{ label: "Rating Tags" }] },
    { path: "/admin/service-categories", items: [{ label: "Service Categories" }] },
    { path: "/admin/service-types", items: [{ label: "Service types" }] },
    {
        path: "/admin/roles/permissions/",
        startsWith: true,
        items: [{ label: "Roles", href: "/admin/roles" }, { label: "Role Permissions" }]
    },
    {
        path: "/admin/admins/permissions/",
        startsWith: true,
        items: [{ label: "Sub Admins", href: "/admin/admins" }, { label: "Admin Permissions" }]
    }
];