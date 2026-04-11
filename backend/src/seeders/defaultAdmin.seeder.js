import bcrypt from "bcryptjs";
import { Admin, Role } from "../models/index.js";

/** Default super admin credentials for seeded environments. */
const permissions = [201, 205, 101, 105, 102, 202, 203, 103, 104, 204, 100, 301, 302, 303, 304, 311, 312, 313, 314, 321, 322, 323, 324, 331, 332, 333, 334, 341, 342, 343, 344, 351, 352, 353, 354, 361, 362, 363, 364, 371, 372, 373, 374, 377, 376, 375, 378, 381, 382, 383, 384, 391, 392, 393, 394, 401, 402, 403, 413, 412, 411, 414, 421, 422, 423, 424];
export const DEFAULT_ADMIN_SEED = {
    name: "Super Admin",
    email: "admin@admin.com",
    mobile: "9876543210",
    password: "123456789"
};

/**
 * Seed a default super admin account (idempotent).
 * - Ensures "Super Admin" role exists and is active.
 * - Creates admin only when no admin exists with same email/mobile.
 *
 * @returns {Promise<{ created: boolean, roleId: string, adminId: string | null }>}
 */
export async function seedDefaultAdmin() {
    const role = await Role.findOneAndUpdate(
        { name: "Super Admin", deletedAt: null },
        { $setOnInsert: { name: "Super Admin", permissions }, $set: { isActive: true, deletedAt: null } },
        { upsert: true, new: true }
    );

    const existing = await Admin.findOne({
        deletedAt: null,
        $or: [
            { email: DEFAULT_ADMIN_SEED.email },
            { mobile: DEFAULT_ADMIN_SEED.mobile }
        ]
    }).select("_id");

    if (existing) {
        return { created: false, roleId: String(role._id), adminId: String(existing._id) };
    }

    const hashed = await bcrypt.hash(DEFAULT_ADMIN_SEED.password, 10);
    const admin = await Admin.create({
        name: DEFAULT_ADMIN_SEED.name,
        email: DEFAULT_ADMIN_SEED.email,
        mobile: DEFAULT_ADMIN_SEED.mobile,
        permissions,
        password: hashed,
        roleId: role._id,
        isActive: true
    });

    return { created: true, roleId: String(role._id), adminId: String(admin._id) };
}

