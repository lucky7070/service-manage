import bcrypt from "bcryptjs";
import { Admin, Role } from "../models/index.js";

/** Default super admin credentials for seeded environments. */
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
        { $setOnInsert: { name: "Super Admin", permissions: [] }, $set: { isActive: true, deletedAt: null } },
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
        password: hashed,
        roleId: role._id,
        isActive: true
    });

    return { created: true, roleId: String(role._id), adminId: String(admin._id) };
}

