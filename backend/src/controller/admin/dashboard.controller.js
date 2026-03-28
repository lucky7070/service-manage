import { Admin, City, Country, Customer, PredefinedRatingTag, Role, ServiceCategory, ServiceType, State } from "../../models/index.js";

export const getDashboardStats = async (req, res) => {
    try {
        const filter = { deletedAt: null };

        const [roles, admins, countries, states, cities, customers, predefinedRatingTags, serviceCategories, serviceTypes] = await Promise.all([
            Role.countDocuments(filter),
            Admin.countDocuments(filter),
            Country.countDocuments(filter),
            State.countDocuments(filter),
            City.countDocuments(filter),
            Customer.countDocuments(filter),
            PredefinedRatingTag.countDocuments(filter),
            ServiceCategory.countDocuments(filter),
            ServiceType.countDocuments(filter)
        ]);

        return res.success({
            roles,
            admins,
            countries,
            states,
            cities,
            customers,
            predefinedRatingTags,
            serviceCategories,
            serviceTypes
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

