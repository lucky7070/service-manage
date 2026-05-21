/**
 * Generates `postman/Service-Manage.postman_collection.json` from this hand-maintained list.
 *
 * **Why:** Keeps Postman in sync with the backend without editing JSON by hand. One command
 * reproduces the full collection shape (including folder grouping for **Admin (authenticated)**).
 *
 * **When to run:** After you add or change API routes — update the arrays in this file, then:
 *   `node postman/generate-postman-collection.mjs`
 *
 * **Caution:** Overwrites the existing collection file; commit or backup first if you only edited JSON in Postman.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Shown in Postman → Collection description (mobile flows, auth, sockets). */
const COLLECTION_DESCRIPTION = [
    "## Service Manage API — mobile & integrations",
    "",
    "REST base path is `{{baseUrl}}` → `{host}/api`. Server root `{{rootUrl}}/health` is outside `/api`.",
    "",
    "### Headers and security (every app)",
    "",
    "- **`x-api-key`**: required on (almost) all calls. Set collection variable `xApiKey` = backend `X_API_KEY` from `.env`.",
    "- **Customer session (web)**: httpOnly cookie **`customer_token`** (JWT) after `POST /customer/register`. Browser clients use **`withCredentials`** / cookie jar.",
    "- **Customer session (mobile)**: same **`POST /customer/register`** returns **`data.token`** (JWT). Send **`Authorization: Bearer <token>`** on authenticated routes. Cookie is also set but mobile can ignore it.",
    "- **Service provider session**: cookie **`service-provider-token`** after `POST /service-provider/login` or `POST /service-provider/register`.",
    "- **Admin session**: cookie **`admin_token`** after Admin login (web/postman cookie jar).",
    "",
    "**Native iOS/Android (customer):** store **`data.token`** from register in secure storage; attach **`Authorization: Bearer {{customerToken}}`** on each request. Web keeps using cookies only.",
    "",
    "### Customer app — end-to-end flow",
    "",
    "1. **OTP:** `POST /customer/send-otp` with `purpose`: `register` (new user) or `login` (existing).",
    "2. **Session:** `POST /customer/register` with mobile + OTP + **name**. Web: **`customer_token`** cookie. Mobile: save **`data.token`** and use Bearer header.",
    "3. **Profile / home:** `GET /customer/profile`, `GET /customer/dashboard`.",
    "4. **Addresses:** `/customer/addresses` — need at least one address to create a booking.",
    "5. **Discovery (no auth):** **Open (public)** — settings, categories, cities, **`GET /featured-service-providers`** (homepage grid; approved verified providers with **`isFeatured`**), providers by city/category, **`GET /service-types-by-category/:categorySlug`**, **`GET /feedback-rating-tags?tagFor=provider`** for rating chips.",
    "6. **Booking** vs **lead:** **`POST /customer/bookings`** assigns a chosen provider immediately. **`POST /customer/service-leads`** creates an open **service lead** (city + category + types + address); admin assigns a provider via **`PUT /admin/service-leads/:id/assign`**.",
    "7. **Statuses** (poll `GET /customer/bookings/:id`): `pending` → `price_pending` → **`PUT .../accept-quote`** → `price_agreed` / `confirmed` → provider **`POST .../start`** → `in_progress` → provider completion OTP → **`completed`**. Terminal: `cancelled`.",
    "8. **Chat (REST):** booking messages endpoints.",
    "9. **Realtime (optional):** Socket.IO on API server — emit **`booking:join`** `{ bookingId, role: \"customer\" }`, listen for **`booking:presence`**, **`booking:typing`**, emit **`booking:leave`** with booking id when leaving chat.",
    "10. **After `completed`:** `POST /customer/bookings/:id/feedback`. Detail payload may include **customerFeedback**.",
    "11. **Profile photo:** `PUT /customer/profile/image` — multipart **`image`** (auth).",
    "12. **Mark job done (customer):** when status **`in_progress`**, **`PUT /customer/bookings/:id/complete`** (empty body; confirms completion alongside provider OTP flow — see backend for exact lifecycle).",
    "13. **Logout:** `POST /customer/logout`.",
    "",
    "### Service provider app — end-to-end flow",
    "",
    "1. **OTP** → **`POST /service-provider/login`** or multipart **`POST /service-provider/register`**. Cookie **`service-provider-token`**.",
    "2. **Jobs:** list/detail bookings.",
    "3. **Quote:** `PUT .../quote` → customer **`PUT /customer/bookings/:id/accept-quote`**.",
    "4. **On site:** `POST .../start` (when status `confirmed` and price agreed).",
    "5. **Finish:** `POST .../complete/send-otp` → `POST .../complete` with body `{ otp }`.",
    "6. **Self-service catalogue:** **`GET /service-provider/services`**, **`GET /service-provider/service-types`** (query **`query`**, **`limit`**), **`POST /PUT /DELETE /service-provider/services/...`** for your **`ProviderService`** pricing.",
    "7. **Feedback:** `GET /feedback-rating-tags?tagFor=customer` then `POST .../feedback` when **`completed`**.",
    "8. **Sockets:** join with `role: \"provider\"`.",
    "",
    "**Admin auth** then **Admin (authenticated)** — back-office, not typical consumer mobile.",
    "",
    "### Postman",
    "",
    "**Regenerate:** from repo root run `node postman/generate-postman-collection.mjs` after editing this script (overwrites **`postman/Service-Manage.postman_collection.json`**).",
].join("\n");

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

function folder(name, description, items) {
    const f = { name, item: items };
    if (description) f.description = description;
    return f;
}

function urlFromItem(it) {
    const u = it?.request?.url;
    if (!u) return "";
    return typeof u === "string" ? u : u.raw || "";
}

function moduleForAdminUrl(url) {
    const u = String(url);
    if (u.includes("/admin/dashboard-stats") || u.includes("/admin/bookings")) return "Dashboard & bookings";
    if (u.includes("/admin/service-leads")) return "Service leads";
    if (u.includes("/admin/profile") || u.includes("/admin/notifications") || u.includes("/admin/logout")) return "Profile & session";
    if (u.includes("/admin/settings")) return "Settings";
    if (u.includes("/admin/roles")) return "Roles";
    if (u.includes("/admin/admins")) return "Sub admins";
    if (u.includes("/admin/countries") || u.includes("/admin/states") || u.includes("/admin/cities")) return "Geography";
    if (u.includes("/admin/customers")) return "Customers";
    if (u.includes("/admin/service-providers")) return "Service providers";
    if (u.includes("/admin/rating-tags")) return "Rating tags";
    if (u.includes("/admin/faqs")) return "FAQs";
    if (u.includes("/admin/service-categories")) return "Service categories";
    if (u.includes("/admin/service-types")) return "Service types";
    if (u.includes("/admin/banners")) return "Banners";
    if (u.includes("/admin/enquiries")) return "Enquiries";
    if (u.includes("/admin/testimonials")) return "Testimonials";
    if (u.includes("/admin/cms-pages")) return "CMS pages";
    if (u.includes("/admin/our-values") || u.includes("/admin/our-milestones")) return "Our content (values & milestones)";
    return "Other";
}

const ADMIN_MODULE_ORDER = [
    "Dashboard & bookings",
    "Service leads",
    "Profile & session",
    "Settings",
    "Roles",
    "Sub admins",
    "Geography",
    "Customers",
    "Service providers",
    "Rating tags",
    "FAQs",
    "Service categories",
    "Service types",
    "Banners",
    "Enquiries",
    "Testimonials",
    "CMS pages",
    "Our content (values & milestones)",
    "Other",
];

function regroupAdminAuthenticatedFolder(collectionRoot) {
    const adminIdx = collectionRoot.item.findIndex((x) => x.name === "Admin (authenticated)");
    if (adminIdx === -1) return;

    const items = collectionRoot.item[adminIdx].item;
    const buckets = new Map();
    for (const it of items) {
        const m = moduleForAdminUrl(urlFromItem(it));
        if (!buckets.has(m)) buckets.set(m, []);
        buckets.get(m).push(it);
    }

    collectionRoot.item[adminIdx].item = ADMIN_MODULE_ORDER.filter((name) => buckets.has(name)).map((name) => ({
        name,
        item: buckets.get(name),
    }));
}

const collection = {
    info: {
        name: "Service Manage API",
        description: COLLECTION_DESCRIPTION,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    variable: [
        { key: "baseUrl", value: "http://localhost:5000/api" },
        { key: "rootUrl", value: "http://localhost:5000" },
        { key: "xApiKey", value: "" },
    ],
    item: [
        folder("Health", "Liveness probe at server root (not under `/api`). Use to verify host/port before calling `{{baseUrl}}` routes.", [
            {
                name: "Health check",
                request: {
                    method: "GET",
                    header: [],
                    url: "{{rootUrl}}/health",
                },
            },
        ]),
    ],
};

const open = [
    req("General settings", "GET", "/general-settings"),
    req("Service categories list", "GET", "/service-categories-list?query=&limit=20"),
    req("Service categories (home)", "GET", "/service-categories-home"),
    req("Service category by slug", "GET", "/service-categories/plumbing"),
    req("List providers by city + category slug", "GET", "/service-providers/jodhpur/electrician?pageNo=1&limit=12&query=", {
        description: "Path segments are **city slug** and **service category slug** (lowercase). Adjust to match your seeded data.",
    }),
    req("Featured providers (home)", "GET", "/featured-service-providers?limit=8", {
        description:
            "**Public.** Returns approved, verified, active providers with **`isFeatured: true`** (admin sets on provider). Sorted by ratings / completed jobs. Used for marketing homepage.",
    }),
    req("Public provider by id or slug", "GET", `/service-provider-details/${OID}`, {
        description:
            "Optional query **`serviceCategorySlug`** — narrows book-page context when applicable (e.g. `?serviceCategorySlug=electrician`).",
    }),
    req(
        "Service types by category slug (public)",
        "GET",
        "/service-types-by-category/electrician",
        {
            description:
                "**Path:** category **slug** (lowercase). Returns active **`ServiceType`** docs for that category (name, **`basePrice`**, **`estimatedTimeMinutes`**, etc.). No pagination in API.",
        }
    ),
    req("States list", "GET", "/states-list?query=&limit=20"),
    req("Cities list", "GET", `/cities-list?stateId=${OID}&query=&limit=20`),
    req("Cities with state (combined)", "GET", "/cities-with-state?query=&limit=20"),
    req("Testimonials (public)", "GET", "/testimonials?limit=6&from="),
    req("About content", "GET", "/about-content"),
    req("Privacy policy", "GET", "/privacy-policy"),
    req("Terms and conditions", "GET", "/terms-and-conditions"),
    req("Feedback rating tags (public)", "GET", "/feedback-rating-tags?tagFor=provider", {
        description: "Query **`tagFor`** is required: `customer` (tags shown when provider rates customer) or `provider` (tags when customer rates provider).",
    }),
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
    req("Send OTP", "POST", "/customer/send-otp", {
        body: { mobile: "9876543210", purpose: "register" },
        description:
            "Use `purpose`: `register` (new users) or `login` (existing). Next: **`POST /customer/register`** with same mobile + OTP + **name**. In **development**, OTP may be returned in the response body.",
    }),
    req("Register", "POST", "/customer/register", {
        body: { mobile: "9876543210", otp: "123456", name: "Test User", referralCode: "" },
        description:
            "`referralCode` optional. Optional **`registerFrom`: `\"mobile\"`** for new signups. Response **`data`** includes profile + **`token`** (JWT). Web uses **`customer_token`** cookie; mobile stores **`token`** and sends **`Authorization: Bearer <token>`**. **Name** required even for login.",
    }),
    req("Profile (auth)", "GET", "/customer/profile", {
        description: "Auth via **`customer_token`** cookie (web) **or** **`Authorization: Bearer <token>`** (mobile). Always send **`x-api-key`**.",
    }),
    req("Update profile (auth)", "PUT", "/customer/profile", { body: { name: "Test User", email: "customer@example.com", dateOfBirth: "1990-01-15", preferredLanguage: "en" } }),
    req("Update profile photo (auth, multipart)", "PUT", "/customer/profile/image", {
        formdata: [fd.file("image")],
        description:
            "**Field name `image`**. Validates as customer **`customer-profile-image`**. Separate from **`PUT /customer/profile`** (text fields only).",
    }),
    req("Dashboard (auth)", "GET", "/customer/dashboard"),
    req("Bookings (auth)", "GET", "/customer/bookings?pageNo=1&limit=10&status="),
    req("Create booking (auth)", "POST", "/customer/bookings", {
        body: {
            providerId: OID,
            serviceTypeId: [OID],
            addressId: OID,
            scheduledTime: "2026-12-15T10:30:00.000Z",
            issueDescription: "Please bring required tools.",
        },
        description:
            "**Body:** **`providerId`**, **`serviceTypeId`** = array of **ServiceType** ObjectIds offered by that provider, **`addressId`** = customer's saved **`Address`** _id (not `bookingAddressId`), **`scheduledTime`** ISO8601, optional **`issueDescription`**.",
    }),
    req("Booking detail (auth)", "GET", `/customer/bookings/${OID}`, {
        description: "Includes **customerFeedback** (your rating of the provider) when you already submitted feedback; `null` until then.",
    }),
    req("Accept quote (auth)", "PUT", `/customer/bookings/${OID}/accept-quote`, {
        body: {},
        description: "When status is **`price_pending`**, after provider sent a quote. Confirms price so the job can move to **confirmed** / start.",
    }),
    req("Cancel booking (auth)", "PUT", `/customer/bookings/${OID}/cancel`, {
        body: { cancellationReason: "Need to reschedule" },
    }),
    req("Mark booking complete — customer confirms (auth)", "PUT", `/customer/bookings/${OID}/complete`, {
        body: {},
        description:
            "Allowed when **`in_progress`** and **`startTime`** set. Sets **`completed`** (used together with provider completion OTP pattern — verify against your **`Booking`** workflow). Empty JSON body.",
    }),
    req("My service leads (auth)", "GET", "/customer/service-leads?pageNo=1&limit=10&status=", {
        description: "Booking requests filed without a locked-in provider until admin assigns one.",
    }),
    req("Create service lead (auth)", "POST", "/customer/service-leads", {
        body: {
            cityId: OID,
            serviceCategoryId: OID,
            serviceTypeId: [OID],
            addressId: OID,
            scheduledTime: "2026-12-15T10:30:00.000Z",
            issueDescription: "Need urgent repair.",
        },
        description:
            "Same **`serviceTypeId`** / **`addressId`** shape as **`POST /customer/bookings`**, but **`cityId`** + **`serviceCategoryId`** instead of **`providerId`**. Admin **`PUT /admin/service-leads/:id/assign`** with **`providerId`** converts flow to provider assignment.",
    }),
    req("Booking messages list (auth)", "GET", `/customer/bookings/${OID}/messages`),
    req("Send booking message (auth)", "POST", `/customer/bookings/${OID}/messages`, { body: { message: "Hello, confirming the time works for me." } }),
    req("Submit booking feedback — rate provider (auth)", "POST", `/customer/bookings/${OID}/feedback`, {
        body: { starRating: 5, reviewText: "Great experience.", quickTags: [] },
        description:
            "Only when booking status is **`completed`**. `quickTags` = array of PredefinedRatingTag ids from **`GET /feedback-rating-tags?tagFor=provider`**. One submission per booking.",
    }),
    req("Ledger (auth)", "GET", "/customer/ledger?pageNo=1&limit=10&paymentType=&query="),
    req("Addresses (auth)", "GET", "/customer/addresses"),
    req("Create address (auth)", "POST", "/customer/addresses", {
        body: {
            addressLine1: "House 10",
            addressLine2: "Main Road",
            landmark: "Near Market",
            state: OID,
            city: OID,
            pincode: "342001",
            latitude: "26.238947",
            longitude: "73.024309",
            locationType: "home",
            isDefault: 1
        }
    }),
    req("Update address (auth)", "PUT", "/customer/addresses/:addressId", {
        body: {
            addressLine1: "House 10",
            addressLine2: "Main Road",
            landmark: "Near Market",
            state: OID,
            city: OID,
            pincode: "342001",
            latitude: "26.238947",
            longitude: "73.024309",
            locationType: "home",
            isDefault: 1
        }
    }),
    req("Delete address (auth)", "DELETE", "/customer/addresses/:addressId"),
    req("Logout", "POST", "/customer/logout"),
];

const serviceProvider = [
    req("Send OTP", "POST", "/service-provider/send-otp", {
        body: { mobile: "9876543210", purpose: "register" },
        description: "`login` for existing accounts; `register` before multipart **Register**. Same Indian mobile rules as customer.",
    }),
    req("Login", "POST", "/service-provider/login", {
        body: { mobile: "9876543210", otp: "123456" },
        description: "Sets **`service-provider-token`** cookie. Call after **Send OTP**.",
    }),
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
    req("My priced services (auth)", "GET", "/service-provider/services", {
        description:
            "**`ProviderService`** aggregate for logged-in SP: **`record`** rows + **`provider`** mini summary. Requires **`serviceCategoryId`** set on profile.",
    }),
    req(
        "Search service types in my category (auth)",
        "GET",
        "/service-provider/service-types?limit=20&query=",
        {
            description: "Active types for your **`serviceCategoryId`**. **`query`** optional name filter. Use ids in **`POST /service-provider/services`**.",
        }
    ),
    req("Add my service price (auth)", "POST", "/service-provider/services", {
        body: { serviceTypeId: OID, price: 499, status: 1 },
        description:
            "**Type must belong to your **`serviceCategoryId`**. Duplicate **`serviceTypeId`** returns 409. **`status`** 1 = active, 0 = inactive.",
    }),
    req("Update my service price (auth)", "PUT", `/service-provider/services/${OID}`, {
        body: { serviceTypeId: OID, price: 599, status: 1 },
        description: "Replace **`OID`** with **`ProviderService`** _id from **My priced services** list.",
    }),
    req("Remove my service (auth)", "DELETE", `/service-provider/services/${OID}`),
    req("Dashboard (auth)", "GET", "/service-provider/dashboard", {
        description: "Returns **profile**, **workPhotoCount**, **bookingStats** (counts per status + total), **recentBookings** (5 most recent).",
    }),
    req("Bookings (auth)", "GET", "/service-provider/bookings?pageNo=1&limit=10&status="),
    req("Booking detail (auth)", "GET", `/service-provider/bookings/${OID}`),
    req("Set booking quote (auth)", "PUT", `/service-provider/bookings/${OID}/quote`, {
        body: { quotedPrice: 1299.5 },
        description: "Sets **quotedPrice** (customer sees **price_pending**). Customer must **`PUT /customer/bookings/:id/accept-quote`** before **start**.",
    }),
    req("Cancel booking (auth)", "PUT", `/service-provider/bookings/${OID}/cancel`, {
        body: { cancellationReason: "Unable to attend this slot" },
        description: "Blocked for **completed** or **cancelled**. Sets **cancelledBy** to **provider**.",
    }),
    req("Booking messages list (auth)", "GET", `/service-provider/bookings/${OID}/messages`),
    req("Send booking message (auth)", "POST", `/service-provider/bookings/${OID}/messages`, { body: { message: "We can reach you by 11 AM." } }),
    req("Start job — capture startTime (auth)", "POST", `/service-provider/bookings/${OID}/start`, {
        body: { latitude: 26.2389, longitude: 73.0243 },
        description:
            "Requires **confirmed** + **agreedPrice**. Body: device **latitude** / **longitude** (WGS84). Must be within **`job_start_geofence_meters`** (General Settings, default 50 m) of **booking.location** from the customer's address. Moves to **in_progress**.",
    }),
    req("Send completion OTP to customer (auth)", "POST", `/service-provider/bookings/${OID}/complete/send-otp`, {
        description: "Booking must be **in_progress** with **startTime**. Rate-limited. **Development:** OTP may appear in response.",
    }),
    req("Complete booking — verify customer OTP (auth)", "POST", `/service-provider/bookings/${OID}/complete`, {
        body: { otp: "123456" },
        description: "Body: **`otp`** only (plus `bookingId` in URL). Must match SMS OTP sent to customer for this booking.",
    }),
    req("Submit booking feedback — rate customer (auth)", "POST", `/service-provider/bookings/${OID}/feedback`, {
        body: { starRating: 5, reviewText: "Pleasant customer.", quickTags: [] },
        description:
            "Only when **`completed`**. Tags from **`GET /feedback-rating-tags?tagFor=customer`**. One submission per booking.",
    }),
    req("Work photos (auth)", "GET", "/service-provider/work-photos"),
    req("Upload work photos (auth)", "POST", "/service-provider/work-photos", {
        formdata: [fd.file("photos")],
        description: "Form field `photos` — multiple files allowed (max 20). Image files.",
    }),
    req("Reorder work photos (auth)", "PUT", "/service-provider/work-photos/reorder", {
        body: { orderedIds: [OID] },
        description: "Replace orderedIds with all work photo `_id` values in display order.",
    }),
    req("Delete work photo (auth)", "DELETE", `/service-provider/work-photos/${OID}`),
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
    req("Bookings list", "GET", "/admin/bookings?pageNo=1&limit=10&status=&query="),
    req("Booking detail", "GET", `/admin/bookings/${OID}`),
    req("Service leads list", "GET", "/admin/service-leads?pageNo=1&limit=10&status=&query=&sortBy=createdAt&sortOrder=desc", {
        description:
            "**`status`** filter: **`open`** | **`assigned`** | **`cancelled`** (omit for all). Sort fields include **`leadNumber`**, **`customerName`**, **`scheduledTime`**, etc.",
    }),
    req("Service lead detail", "GET", `/admin/service-leads/${OID}`, {
        description:
            "**`open`** lead: searchable provider list **`data.availableProviders`** (same city + category). **`assigned`** lead includes linked **`booking`** snippet.",
    }),
    req("Assign provider to lead", "PUT", `/admin/service-leads/${OID}/assign`, {
        body: { providerId: OID },
        description:
            "Only **`open`** leads. Provider must match lead **`cityId`** + **`serviceCategoryId`**, approved, verified, active, and have **every** **`ProviderService`** for the requested service types.",
    }),
    req("Cancel open service lead", "PUT", `/admin/service-leads/${OID}/cancel`, {
        body: {},
        description: "Only **`open`** leads (**`assigned`** must be undone via Booking cancellation / separate flow). Empty JSON `{}` acceptable.",
    }),
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
    req("Customer addresses (admin)", "GET", `/admin/customers/${OID}/addresses`),
    req("Create customer address (admin)", "POST", `/admin/customers/${OID}/addresses`, {
        body: {
            addressLine1: "House 10",
            addressLine2: "Main Road",
            landmark: "Near Market",
            state: OID,
            city: OID,
            pincode: "342001",
            latitude: "26.238947",
            longitude: "73.024309",
            locationType: "home",
            isDefault: 1,
        },
    }),
    req("Update customer address (admin)", "PUT", `/admin/customers/${OID}/addresses/${OID}`, {
        body: {
            addressLine1: "House 10",
            addressLine2: "Main Road",
            landmark: "Near Market",
            state: OID,
            city: OID,
            pincode: "342001",
            latitude: "26.238947",
            longitude: "73.024309",
            locationType: "home",
            isDefault: 1,
        },
    }),
    req("Delete customer address (admin)", "DELETE", `/admin/customers/${OID}/addresses/${OID}`),
    req("Customer ledger", "GET", "/admin/customers/:id/ledger?pageNo=1&limit=10&paymentType=&query="),
    req("Add customer ledger entry", "POST", "/admin/customers/:id/ledger", {
        body: { paymentType: 1, amount: 100, particulars: "Admin wallet credit" },
    }),
    req("Create service provider (multipart)", "POST", "/admin/service-providers", {
        formdata: [
            fd.text("name", "SP Name"),
            fd.text("mobile", "9123456789"),
            fd.text("email", "sp@example.com"),
            fd.text("cityId", OID),
            fd.text("serviceCategoryId", OID),
            fd.text("panCardNumber", "ABCDE1234F"),
            fd.text("aadharNumber", "123456789012"),
            fd.text("experienceYears", "2"),
            fd.text("experienceDescription", "Experienced technician."),
            fd.text("isFeatured", "0"),
            fd.file("image"),
            fd.file("panCardDocument"),
            fd.file("aadharDocument"),
        ],
        description:
            "**`cityId`**, **`serviceCategoryId`** required. **`isFeatured`** `1` / `true` / `on` to show on homepage (**`GET /featured-service-providers`**). Omit checkbox in forms → send `0`.",
    }),
    req("Update service provider (multipart)", "PUT", "/admin/service-providers/:id", {
        formdata: [
            fd.text("name", "SP Name"),
            fd.text("mobile", "9123456789"),
            fd.text("email", "sp@example.com"),
            fd.text("cityId", OID),
            fd.text("serviceCategoryId", OID),
            fd.text("panCardNumber", "ABCDE1234F"),
            fd.text("aadharNumber", "123456789012"),
            fd.text("experienceYears", "2"),
            fd.text("experienceDescription", "Experienced technician."),
            fd.text("isFeatured", "0"),
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
    req("List our values (admin)", "GET", "/admin/our-values"),
    req("Create our value (multipart)", "POST", "/admin/our-values", {
        formdata: [
            fd.text("title", "Reliability"),
            fd.text("description", "We show up on time, every time."),
            fd.text("displayOrder", "0"),
            fd.text("status", "1"),
            fd.file("icon"),
        ],
        description: "Multipart **`icon`** required on create.",
    }),
    req("Update our value (multipart)", "PUT", "/admin/our-values/:id", {
        formdata: [
            fd.text("title", "Reliability"),
            fd.text("description", "We show up on time, every time."),
            fd.text("displayOrder", "0"),
            fd.text("status", "1"),
            fd.file("icon"),
        ],
        description: "Icon optional on update — attach only when replacing.",
    }),
    req("Delete our value", "DELETE", "/admin/our-values/:id"),
    req("List our milestones (admin)", "GET", "/admin/our-milestones"),
    req("Create our milestone", "POST", "/admin/our-milestones", {
        body: { year: "2020", event: "Company founded in Jodhpur.", displayOrder: 0, status: 1 },
    }),
    req("Update our milestone", "PUT", "/admin/our-milestones/:id", {
        body: { year: "2020", event: "Company founded in Jodhpur.", displayOrder: 0, status: 1 },
    }),
    req("Delete our milestone", "DELETE", "/admin/our-milestones/:id"),
];

collection.item.push(
    folder(
        "Open (public)",
        "No auth cookie — send **`x-api-key`**. Includes **`featured-service-providers`** (homepage), **`service-types-by-category/:slug`**, categories, cities, provider search, enquiries, **`feedback-rating-tags`**.",
        open
    )
);
collection.item.push(
    folder(
        "Customer",
        "After **Register**: web uses cookie **`customer_token`**; mobile uses **`data.token`** with Bearer. Addresses → **`POST /customer/bookings`** or **`POST /customer/service-leads`** → ledger, messages, accept quote → feedback after **`completed`**; **`PUT /customer/profile/image`** for photo.",
        customer
    )
);
collection.item.push(
    folder(
        "Service provider",
        "Cookie **`service-provider-token`**. **`/services`** CRUD + bookings (quote → start → OTP complete) → **feedback**; work photos + Socket.IO.",
        serviceProvider
    )
);
collection.item.push(
    folder("Admin auth", "Sets **`admin_token`**. Run before **Admin (authenticated)**.", adminAuth)
);
collection.item.push(folder("Admin (authenticated)", "Requires **admin** cookie. Route modules are grouped into subfolders below.", admin));

regroupAdminAuthenticatedFolder(collection);
const out = path.join(__dirname, "Service-Manage.postman_collection.json");
fs.writeFileSync(out, JSON.stringify(collection, null, 2), "utf8");
console.log("Wrote", out);
