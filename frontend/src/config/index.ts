import { Building2, Globe, LayoutDashboard, Map, MapPinned, Settings, Shield, UserCog, Users } from "lucide-react";

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

];

export const MENU: Array<SidebarItem | SidebarGroup> = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, permission_id: true },
    {
        label: "User Management",
        icon: Shield,
        children: [
            { href: "/admin/roles", label: "Roles", icon: UserCog, permission_id: 104 },
            { href: "/admin/admins", label: "Sub Admins", icon: Users, permission_id: 204 },
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
];