import mongoose from "mongoose";
import { orderId } from "../helpers/utils.js";
import { Counter } from "./Counter.js";

const Schema = new mongoose.Schema(
    {
        userId: { type: String, unique: true, index: true, default: null },
        name: { type: String, required: true, trim: true, default: null },
        mobile: { type: String, required: true, unique: true, index: true, default: null },
        email: { type: String, unique: true, sparse: true, index: true, lowercase: true, trim: true, default: null },
        password: { type: String, required: true, default: null, select: false },
        image: { type: String, default: '/admins/default.png' },
        permissions: { type: [Number], default: [] }, // 101, 102
        roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: null },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.userId) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate({ _id: "Admin" }, { $inc: { seq: 1 } }, { upsert: true, new: true, ...options });
        this.userId = orderId(counter.seq, "A", 6);
    }

    next();
});

export const Admin = mongoose.model("Admin", Schema);
