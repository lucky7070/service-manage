/**
 * Generates postman/Service-Manage.postman_collection.json
 * Run: node postman/generate-postman-collection.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const headerApiKey = [
    { key: "x-api-key", value: "{{xApiKey}}", type: "text" },
];

/** Placeholder Mongo ObjectId (replace with real ids from your DB). */
const OID = "507f1f77bcf86cd799439011";

const fd = {
    text: (key, value) => ({ key, value: String(value), type: "text", enabled: true }),
    file: (key) => ({ key, type: "file", src: [] }),
};

function req(name, method, urlPath, opts = {}) {
    // Postman must get `url` as a string (or a full Url object with host/path).
    // An object with only `{ raw }` often imports with a blank URL bar in the app.
    const urlStr = `{{baseUrl}}${urlPath}`;
    const item = {
        name,
        request: {
            method,
            header: opts.noApiKey ? [] : [...headerApiKey],
            url: urlStr,
        },
    };
    if (opts.formdata) {
        item.request.body = {
            mode: "formdata",
            formdata: opts.formdata,
        };
    } else if (opts.body !== undefined) {
        item.request.body = {
            mode: "raw",
            raw: typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body, null, 2),
            options: { raw: { language: "json" } },
        };
        item.request.header.push({ key: "Content-Type", value: "application/json" });
    }
    if (opts.description) {
        item.request.description = opts.description;
    }
    return item;
}

const collection = {
    info: {
        name: "Service Manage API",
        description:
            "Backend routes under `/api` (except `/health` at server root).\n\n" +
            "- Set `xApiKey` to match `X_API_KEY` in backend `.env`.\n" +
            "- Admin routes: **Admin auth → Login** first (cookies on).\n" +
            "- JSON bodies use sample values; replace Mongo ids like `507f1f77bcf86cd799439011` with real ids from your DB.\n" +
            "- Multipart requests include **form-data** defaults; attach files where indicated.",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    variable: [
        { key: "baseUrl", value: "http://localhost:5000/api" },
        { key: "rootUrl", value: "http://localhost:5000" },
        { key: "xApiKey", value: "" },
    ],
    item: [
        {
            name: "Health",
            item: [
                {
                    name: "Health check",
                    request: {
                        method: "GET",
                        header: [],
                        url: "{{rootUrl}}/health",
                    },
                },
            ],
        },
    ],
};

const open = [
    req("General settings", "GET", "/general-settings"),
    req("Service categories list", "GET", "/service-categories-list?query=&limit=20"),
    req("Cities list", "GET", "/cities-list?query=&limit=20"),
    req("Testimonials (public)", "GET", "/testimonials?limit=6&form="),
    req(
        "Submit enquiry (contact)",
        "POST",
        "/enquiries",
        {
            body: {
                name: "Test User",
                email: "test@example.com",
                phone: "9876543210",
                subject: "Hello",
                message: "This is a test message with enough length.",
            },
        }
    ),
];

const customer = [
    req("Send OTP", "POST", "/customer/send-otp", { body: { mobile: "9876543210", purpose: "registration" } }),
    req("Register", "POST", "/customer/register", { body: { mobile: "9876543210", otp: "123456", name: "Test User" } }),
    req("Profile (auth)", "GET", "/customer/profile", { description: "Requires customer cookie after register/login flow." }),
    req("Logout", "POST", "/customer/logout"),
];

const serviceProvider = [
    req("Send OTP", "POST", "/service-provider/send-otp", { body: { mobile: "9876543210", purpose: "registration" } }),
    req("Login", "POST", "/service-provider/login", { body: { mobile: "9876543210", otp: "123456" } }),
    req("Register (multipart)", "POST", "/service-provider/register", {
        formdata: [
            fd.text("name", "Demo Provider"),
            fd.text("mobile", "9876543210"),
            fd.text("email", "provider@example.com"),
            fd.text("cityId", OID),
            fd.text("serviceCategoryId", OID),
            fd.text("panCardNumber", "ABCDE1234F"),
            fd.text("aadharNumber", "123456789012"),
            fd.text("experienceYears", "3"),
            fd.text("experienceDescription", "Field service experience."),
            fd.text("otp", "123456"),
            fd.file("image"),
            fd.file("panCardDocument"),
            fd.file("aadharDocument"),
        ],
        description: "Replace cityId, serviceCategoryId, and otp with real values. Attach files for image, panCardDocument (PDF), aadharDocument (PDF).",
    }),
    req("Profile (auth)", "GET", "/service-provider/profile"),
];

const adminAuth = [
    req("Admin login", "POST", "/admin/login", {
        body: { identifier: "admin@example.com", password: "yourpassword" },
        description: "Saves admin cookie for subsequent /admin/* requests.",
    }),
    req("Forgot password", "POST", "/admin/forgot-password", { body: { email: "admin@example.com" } }),
    req("Forgot password reset", "POST", "/admin/forgot-password/reset", {
        body: {
            email: "admin@example.com",
            otp: "123456",
            new_password: "Newpass123!",
            confirm_password: "Newpass123!",
        },
    }),
];

const admin = [
    req("Dashboard stats", "GET", "/admin/dashboard-stats"),
    req("Admin profile", "GET", "/admin/profile"),
    req("Notifications read all", "PUT", "/admin/notifications/read-all"),
    req("Update profile", "PUT", "/admin/profile", { body: { name: "Admin User", mobile: "9876543210", email: "admin@example.com" } }),
    req("Update password", "PUT", "/admin/profile/password", {
        body: {
            current_password: "CurrentP1!",
            new_password: "Newpass12!",
            confirm_password: "Newpass12!",
        },
    }),
    req("Update profile image (multipart)", "PUT", "/admin/profile/image", {
        formdata: [fd.file("image")],
        description: "Select an image file for `image`.",
    }),
    req("Admin logout", "POST", "/admin/logout"),
    req("Settings (all)", "GET", "/admin/settings"),
    req("Settings by type", "GET", "/admin/settings/1"),
    req("Update settings by type (multipart)", "PUT", "/admin/settings/1", { description: "Multipart per setting fields." }),
    req("Create role", "POST", "/admin/roles", { body: { name: "Role", status: 1 } }),
    req("Update role", "PUT", "/admin/roles/:id", { body: { name: "Role", status: 1 } }),
    req("Delete role", "DELETE", "/admin/roles/:id"),
    req("Get single role", "GET", "/admin/roles/:id"),
    req("List roles", "GET", "/admin/roles"),
    req("Add role permissions", "PUT", "/admin/roles/:id/permissions", {
        body: { permissions: [101, 102, 103] },
        description: "Permission ids must match your Permission model / seed (numeric codes).",
    }),
    req("List admins", "GET", "/admin/admins"),
    req("Create admin", "POST", "/admin/admins", {
        body: {
            name: "Sub Admin",
            mobile: "9876543210",
            roleId: OID,
            email: "subadmin@example.com",
            password: "Adminpass1!",
            status: 1,
        },
    }),
    req("Update admin", "PUT", "/admin/admins/:id", {
        body: {
            name: "Sub Admin",
            mobile: "9876543210",
            roleId: OID,
            email: "subadmin@example.com",
            status: 1,
        },
    }),
    req("Admin permissions", "PUT", "/admin/admins/:id/permissions", {
        body: { permissions: [201, 202] },
        description: "Use numeric permission codes from your app.",
    }),
    req("Delete admin", "DELETE", "/admin/admins/:id"),
    req("Get admin", "GET", "/admin/admins/:id"),
    req("Create country", "POST", "/admin/countries", { body: { name: "India", status: 1 } }),
    req("Update country", "PUT", "/admin/countries/:id", { body: { name: "India", status: 1 } }),
    req("Delete country", "DELETE", "/admin/countries/:id"),
    req("Get country", "GET", "/admin/countries/:id"),
    req("List countries", "GET", "/admin/countries"),
    req("Create state", "POST", "/admin/states", { body: { countryId: OID, name: "Maharashtra", status: 1 } }),
    req("Update state", "PUT", "/admin/states/:id", { body: { countryId: OID, name: "Maharashtra", status: 1 } }),
    req("Delete state", "DELETE", "/admin/states/:id"),
    req("Get state", "GET", "/admin/states/:id"),
    req("List states", "GET", "/admin/states"),
    req("Create city", "POST", "/admin/cities", { body: { countryId: OID, stateId: OID, name: "Mumbai", status: 1 } }),
    req("Update city", "PUT", "/admin/cities/:id", { body: { countryId: OID, stateId: OID, name: "Mumbai", status: 1 } }),
    req("Delete city", "DELETE", "/admin/cities/:id"),
    req("Get city", "GET", "/admin/cities/:id"),
    req("List cities", "GET", "/admin/cities"),
    req("Create customer (multipart)", "POST", "/admin/customers", {
        formdata: [
            fd.text("name", "Test Customer"),
            fd.text("mobile", "9876543210"),
            fd.text("email", "customer@example.com"),
            fd.text("dateOfBirth", "1990-01-15"),
            fd.text("status", "1"),
            fd.file("image"),
        ],
        description: "Optional profile image. All text fields required by validator.",
    }),
    req("Update customer (multipart)", "PUT", "/admin/customers/:id", {
        formdata: [
            fd.text("name", "Test Customer"),
            fd.text("mobile", "9876543210"),
            fd.text("email", "customer@example.com"),
            fd.text("dateOfBirth", "1990-01-15"),
            fd.text("status", "1"),
            fd.file("image"),
        ],
    }),
    req("Delete customer", "DELETE", "/admin/customers/:id"),
    req("Get customer", "GET", "/admin/customers/:id"),
    req("List customers", "GET", "/admin/customers"),
    req("Create service provider (multipart)", "POST", "/admin/service-providers", {
        formdata: [
            fd.text("name", "SP Name"),
            fd.text("mobile", "9123456789"),
            fd.text("email", "sp@example.com"),
            fd.text("panCardNumber", "ABCDE1234F"),
            fd.text("aadharNumber", "123456789012"),
            fd.text("experienceYears", "2"),
            fd.text("experienceDescription", "Experienced technician."),
            fd.file("image"),
            fd.file("panCardDocument"),
            fd.file("aadharDocument"),
        ],
    }),
    req("Update service provider (multipart)", "PUT", "/admin/service-providers/:id", {
        formdata: [
            fd.text("name", "SP Name"),
            fd.text("mobile", "9123456789"),
            fd.text("email", "sp@example.com"),
            fd.text("panCardNumber", "ABCDE1234F"),
            fd.text("aadharNumber", "123456789012"),
            fd.text("experienceYears", "2"),
            fd.text("experienceDescription", "Experienced technician."),
            fd.file("image"),
            fd.file("panCardDocument"),
            fd.file("aadharDocument"),
        ],
    }),
    req("Update service provider status", "PUT", "/admin/service-providers/:id/status", {
        body: { profileStatus: "approved", isVerified: 1 },
    }),
    req("Delete service provider", "DELETE", "/admin/service-providers/:id"),
    req("Get service provider", "GET", "/admin/service-providers/:id"),
    req("List service providers", "GET", "/admin/service-providers"),
    req("Provider photos", "GET", "/admin/service-providers/:id/photos"),
    req("Upload provider photos (multipart)", "POST", "/admin/service-providers/:id/photos", {
        formdata: [fd.file("photos")],
        description: "Field name `photos` — you can add multiple files in Postman (same key). Max 20.",
    }),
    req("Reorder provider photos", "PUT", "/admin/service-providers/:id/photos/reorder", {
        body: { orderedIds: [OID] },
        description: "Replace orderedIds with all photo _id values for that provider, in desired order.",
    }),
    req("Delete provider photo", "DELETE", "/admin/service-providers/:id/photos/:photoId"),
    req("Provider services", "GET", "/admin/service-providers/:id/services"),
    req("Add provider service", "POST", "/admin/service-providers/:id/services", {
        body: { serviceTypeId: OID, price: 499, status: 1 },
    }),
    req("Update provider service", "PUT", "/admin/service-providers/:id/services/:serviceId", {
        body: { serviceTypeId: OID, price: 599, status: 1 },
    }),
    req("Delete provider service", "DELETE", "/admin/service-providers/:id/services/:serviceId"),
    req("Create rating tag", "POST", "/admin/rating-tags", {
        body: { tagFor: "customer", tagName: "Punctual", tagType: "positive", status: 1 },
    }),
    req("Update rating tag", "PUT", "/admin/rating-tags/:id", {
        body: { tagFor: "customer", tagName: "Punctual", tagType: "positive", status: 1 },
    }),
    req("Delete rating tag", "DELETE", "/admin/rating-tags/:id"),
    req("Get rating tag", "GET", "/admin/rating-tags/:id"),
    req("List rating tags", "GET", "/admin/rating-tags"),
    req("Create FAQ", "POST", "/admin/faqs", {
        body: {
            question: "How do I book a service?",
            answer: "Choose a category and follow the booking steps on the site.",
            status: 1,
            displayOrder: 0,
        },
    }),
    req("Update FAQ", "PUT", "/admin/faqs/:id", {
        body: {
            question: "How do I book a service?",
            answer: "Choose a category and follow the booking steps on the site.",
            status: 1,
            displayOrder: 0,
        },
    }),
    req("Delete FAQ", "DELETE", "/admin/faqs/:id"),
    req("Get FAQ", "GET", "/admin/faqs/:id"),
    req("List FAQs", "GET", "/admin/faqs"),
    req("Service categories options", "GET", "/admin/service-categories/options"),
    req("Create service category (multipart)", "POST", "/admin/service-categories", {
        formdata: [
            fd.text("name", "Plumbing"),
            fd.text("nameHi", "प्लंबिंग"),
            fd.text("description", "Water and pipe related services."),
            fd.text("slug", "plumbing"),
            fd.text("displayOrder", "0"),
            fd.text("status", "1"),
            fd.file("image"),
        ],
    }),
    req("Update service category (multipart)", "PUT", "/admin/service-categories/:id", {
        formdata: [
            fd.text("name", "Plumbing"),
            fd.text("nameHi", "प्लंबिंग"),
            fd.text("description", "Water and pipe related services."),
            fd.text("slug", "plumbing"),
            fd.text("displayOrder", "0"),
            fd.text("status", "1"),
            fd.file("image"),
        ],
    }),
    req("Delete service category", "DELETE", "/admin/service-categories/:id"),
    req("Get service category", "GET", "/admin/service-categories/:id"),
    req("List service categories", "GET", "/admin/service-categories"),
    req("Create service type", "POST", "/admin/service-types", {
        body: { categoryId: OID, name: "Leak repair", status: 1 },
    }),
    req("Update service type", "PUT", "/admin/service-types/:id", {
        body: { categoryId: OID, name: "Leak repair", status: 1 },
    }),
    req("Delete service type", "DELETE", "/admin/service-types/:id"),
    req("Get service type", "GET", "/admin/service-types/:id"),
    req("List service types", "GET", "/admin/service-types"),
    req("Create banner (multipart)", "POST", "/admin/banners", {
        formdata: [
            fd.text("bannerTitle", "Summer offers"),
            fd.text("bannerTitleHi", ""),
            fd.text("bannerSubtitle", "Book now"),
            fd.text("bannerSubtitleHi", ""),
            fd.text("bannerType", "homepage"),
            fd.text("link", "/services"),
            fd.text("displayOrder", "0"),
            fd.file("bannerImage"),
        ],
    }),
    req("Update banner (multipart)", "PUT", "/admin/banners/:id", {
        formdata: [
            fd.text("bannerTitle", "Summer offers"),
            fd.text("bannerTitleHi", ""),
            fd.text("bannerSubtitle", "Book now"),
            fd.text("bannerSubtitleHi", ""),
            fd.text("bannerType", "homepage"),
            fd.text("link", "/services"),
            fd.text("displayOrder", "0"),
            fd.file("bannerImage"),
        ],
    }),
    req("Delete banner", "DELETE", "/admin/banners/:id"),
    req("List banners", "GET", "/admin/banners"),
    req("List enquiries", "GET", "/admin/enquiries"),
    req("Resolve enquiry", "PUT", "/admin/enquiries/:id/resolve", { body: { isResolved: 1 } }),
    req("Delete enquiry", "DELETE", "/admin/enquiries/:id"),
    req("Create testimonial (multipart)", "POST", "/admin/testimonials", {
        formdata: [
            fd.text("form", "customer"),
            fd.text("name", "Rahul Sharma"),
            fd.text("designation", "Home owner"),
            fd.text("rating", "5"),
            fd.text("review", "Quick response and professional work. Highly recommended."),
            fd.text("status", "1"),
            fd.file("image"),
        ],
    }),
    req("Update testimonial (multipart)", "PUT", "/admin/testimonials/:id", {
        formdata: [
            fd.text("form", "customer"),
            fd.text("name", "Rahul Sharma"),
            fd.text("designation", "Home owner"),
            fd.text("rating", "5"),
            fd.text("review", "Quick response and professional work. Highly recommended."),
            fd.text("status", "1"),
            fd.file("image"),
        ],
    }),
    req("Delete testimonial", "DELETE", "/admin/testimonials/:id"),
    req("Get testimonial", "GET", "/admin/testimonials/:id"),
    req("List testimonials (admin)", "GET", "/admin/testimonials"),
    req("Create CMS page", "POST", "/admin/cms-pages", {
        body: {
            pageSlug: "about-us",
            pageTitle: "About Us",
            pageTitleHi: "",
            metaDescription: "Learn about our company and mission.",
            metaKeywords: "about, services, trust",
            content: "<p>We connect customers with trusted service professionals.</p>",
            contentHi: "",
            viewCount: 0,
        },
    }),
    req("Update CMS page", "PUT", "/admin/cms-pages/:id", {
        body: {
            pageSlug: "about-us",
            pageTitle: "About Us",
            pageTitleHi: "",
            metaDescription: "Learn about our company and mission.",
            metaKeywords: "about, services, trust",
            content: "<p>We connect customers with trusted service professionals.</p>",
            contentHi: "",
            viewCount: 0,
        },
    }),
    req("Delete CMS page", "DELETE", "/admin/cms-pages/:id"),
    req("Get CMS page", "GET", "/admin/cms-pages/:id"),
    req("List CMS pages", "GET", "/admin/cms-pages"),
];

collection.item.push({ name: "Open (public)", item: open });
collection.item.push({ name: "Customer", item: customer });
collection.item.push({ name: "Service provider", item: serviceProvider });
collection.item.push({ name: "Admin auth", item: adminAuth });
collection.item.push({ name: "Admin (authenticated)", item: admin });

const out = path.join(__dirname, "Service-Manage.postman_collection.json");
fs.writeFileSync(out, JSON.stringify(collection, null, 2), "utf8");
console.log("Wrote", out);
