import mongoose from "mongoose";
import { connectDb } from "../libraries/db.js";
import { ServiceProvider } from "../models/index.js";
import { ObjectId } from "../helpers/utils.js";

const backfillProviderCategories = async () => {
    await connectDb("backfill-provider-categories");

    const providers = await ServiceProvider.find({
        serviceCategoryId: { $ne: null },
        $or: [{ serviceCategoryIds: { $exists: false } }, { serviceCategoryIds: { $size: 0 } }]
    }).select("_id serviceCategoryId").lean();

    let updated = 0;
    for (const provider of providers) {
        const primary = ObjectId(provider.serviceCategoryId);
        if (!primary) continue;

        await ServiceProvider.updateOne(
            { _id: provider._id },
            { $set: { serviceCategoryIds: [primary] } }
        );
        updated += 1;
    }

    console.log(`Backfill complete. Updated ${updated} provider(s).`);
    await mongoose.disconnect();
};

backfillProviderCategories().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
});
