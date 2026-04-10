import { Building2, CircleHelp, FileText, Globe, HardHat, ImageIcon, LayoutDashboard, Layers, Map, MapPinned, MailQuestionMark, Settings, Shield, Tags, UserCog, UserCircle, Users, Wrench, Quote } from "lucide-react";

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
    items: AdminBreadcrumbItem[];
};

export type AdminBreadcrumbItem = {
    label: string;
    href?: string;
};

export type ProfileStatus = "pending" | "approved" | "rejected" | "suspended";

/** Indian mobile: optional +91 / leading 0, then 10-digit starting with 6–9. */
export const PHONE_REGEXP = /^(?:(?:\+|0{0,2})91(\s*|[-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/;
export const OTP_REGEXP = /^\d{6}$/;
export const PHONE_ERROR_MESSAGE = "Enter a valid Indian mobile number.";
export const SERVICE_PROVIDER_PROFILE_STATUSES: ProfileStatus[] = ["pending", "approved", "rejected", "suspended"];
export const AUTH_PAGES = ["/admin/login", "/admin/forgot-password"];
export const AUTH_PAGES_USER = ["/login"];

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
            { id: 371, label: "Create Service Provider" },
            { id: 372, label: "Update Service Provider" },
            { id: 373, label: "Delete Service Provider" },
            { id: 374, label: "View Service providers" },
            { id: 375, label: "Create Provider Work Photo" },
            { id: 376, label: "Update Provider Work Photo" },
            { id: 377, label: "Delete Provider Work Photo" },
            { id: 378, label: "View Provider Work Photos" },
        ]
    },
    {
        name: "FAQ Management",
        permissions: [
            { id: 381, label: "Create FAQ" },
            { id: 382, label: "Update FAQ" },
            { id: 383, label: "Delete FAQ" },
            { id: 384, label: "View FAQ" },
        ]
    },
    {
        name: "Banner Management",
        permissions: [
            { id: 391, label: "Create Banner" },
            { id: 392, label: "Update Banner" },
            { id: 393, label: "Delete Banner" },
            { id: 394, label: "View Banner" },
        ]
    },
    {
        name: "Enquiry Management",
        permissions: [
            { id: 401, label: "View Enquiries" },
            { id: 402, label: "Resolve Enquiries" },
            { id: 403, label: "Delete Enquiries" },
        ]
    },
    {
        name: "CMS Page Management",
        permissions: [
            { id: 411, label: "Create CMS Page" },
            { id: 412, label: "Update CMS Page" },
            { id: 413, label: "Delete CMS Page" },
            { id: 414, label: "View CMS Page" },
        ]
    },
    {
        name: "Testimonial Management",
        permissions: [
            { id: 421, label: "Create Testimonial" },
            { id: 422, label: "Update Testimonial" },
            { id: 423, label: "Delete Testimonial" },
            { id: 424, label: "View Testimonial" },
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
    { href: "/admin/enquiries", label: "Enquiries", icon: MailQuestionMark, permission_id: 401 },
    {
        label: "Master",
        icon: Tags,
        children: [
            { href: "/admin/rating-tags", label: "Rating Tags", icon: Tags, permission_id: 344 },
            { href: "/admin/service-categories", label: "Service Categories", icon: Layers, permission_id: 354 },
            { href: "/admin/service-types", label: "Service types", icon: Wrench, permission_id: 364 },
            { href: "/admin/faqs", label: "FAQs", icon: CircleHelp, permission_id: 384 },
            { href: "/admin/banners", label: "Banners", icon: ImageIcon, permission_id: 394 },
            { href: "/admin/testimonials", label: "Testimonials", icon: Quote, permission_id: 424 },
            { href: "/admin/cms-pages", label: "CMS Pages", icon: FileText, permission_id: 414 },
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
    {
        path: "/admin/dashboard",
        permission_id: true,
        items: [{ label: "Dashboard" }]
    },
    {
        path: "/admin/roles",
        permission_id: 104,
        items: [{ label: "Roles" }]
    },
    {
        path: "/admin/roles/permissions/:slug",
        permission_id: 105,
        items: [{ label: "Roles", href: "/admin/roles" }, { label: "Role Permissions" }]
    },
    {
        path: "/admin/admins",
        permission_id: 204,
        items: [{ label: "Sub Admins" }]
    },
    {
        path: "/admin/admins/permissions/:slug",
        permission_id: 205,
        items: [{ label: "Sub Admins", href: "/admin/admins" }, { label: "Admin Permissions" }]
    },
    {
        path: "/admin/settings",
        permission_id: true,
        items: [{ label: "Settings" }]
    },
    {
        path: "/admin/countries",
        permission_id: 304,
        items: [{ label: "Countries" }]
    },
    {
        path: "/admin/states",
        permission_id: 314,
        items: [{ label: "States" }]
    },
    {
        path: "/admin/cities",
        permission_id: 324,
        items: [{ label: "Cities" }]
    },
    {
        path: "/admin/customers",
        permission_id: 334,
        items: [{ label: "Customers" }]
    },
    {
        path: "/admin/service-providers",
        permission_id: 374,
        items: [{ label: "Service providers" }]
    },
    {
        path: "/admin/service-providers/:slug/images",
        permission_id: 378,
        items: [{ label: "Service Providers", href: "/admin/service-providers" }, { label: "Work Photos" }]
    },
    {
        path: "/admin/rating-tags",
        permission_id: 344,
        items: [{ label: "Rating Tags" }]
    },
    {
        path: "/admin/service-categories",
        permission_id: 354,
        items: [{ label: "Service Categories" }]
    },
    {
        path: "/admin/service-types",
        permission_id: 364,
        items: [{ label: "Service types" }]
    },
    {
        path: "/admin/faqs",
        permission_id: 384,
        items: [{ label: "FAQs" }]
    },
    {
        path: "/admin/banners",
        permission_id: 394,
        items: [{ label: "Banners" }]
    },
    {
        path: "/admin/enquiries",
        permission_id: 401,
        items: [{ label: "Enquiries" }]
    },
    {
        path: "/admin/cms-pages",
        permission_id: 414,
        items: [{ label: "CMS Pages" }]
    },
    {
        path: "/admin/cms-pages/create",
        permission_id: 411,
        items: [{ label: "CMS Pages", href: "/admin/cms-pages" }, { label: "Create" }]
    },
    {
        path: "/admin/cms-pages/:slug/edit",
        permission_id: 412,
        items: [{ label: "CMS Pages", href: "/admin/cms-pages" }, { label: "Edit" }]
    },
    {
        path: "/admin/testimonials",
        permission_id: 424,
        items: [{ label: "Testimonials" }]
    },
];