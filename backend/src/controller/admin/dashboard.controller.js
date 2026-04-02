import { Admin, City, Country, Customer, Faq, PredefinedRatingTag, Role, ServiceCategory, ServiceProvider, ServiceType, State } from "../../models/index.js";

export const getDashboardStats = async (req, res) => {
    try {
        const filter = { deletedAt: null };

        const [roles, admins, countries, states, cities, customers, predefinedRatingTags, faqs, serviceCategories, serviceTypes, serviceProviders] = await Promise.all([
            Role.countDocuments(filter),
            Admin.countDocuments(filter),
            Country.countDocuments(filter),
            State.countDocuments(filter),
            City.countDocuments(filter),
            Customer.countDocuments(filter),
            PredefinedRatingTag.countDocuments(filter),
            Faq.countDocuments(filter),
            ServiceCategory.countDocuments(filter),
            ServiceType.countDocuments(filter),
            ServiceProvider.countDocuments(filter)
        ]);

        return res.success({
            roles,
            admins,
            countries,
            states,
            cities,
            customers,
            predefinedRatingTags,
            faqs,
            serviceCategories,
            serviceTypes,
            serviceProviders
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

