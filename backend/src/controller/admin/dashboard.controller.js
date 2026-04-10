import { Admin, Banner, City, Country, Customer, Faq, PredefinedRatingTag, Role, ServiceCategory, ServiceProvider, ServiceType, State, Testimonial } from "../../models/index.js";

export const getDashboardStats = async (req, res) => {
    try {
        const filter = { deletedAt: null };

        const [roles, admins, countries, states, cities, customers, predefinedRatingTags, faqs, banners, serviceCategories, serviceTypes, serviceProviders, testimonials] = await Promise.all([
            Role.countDocuments(filter),
            Admin.countDocuments(filter),
            Country.countDocuments(filter),
            State.countDocuments(filter),
            City.countDocuments(filter),
            Customer.countDocuments(filter),
            PredefinedRatingTag.countDocuments(filter),
            Faq.countDocuments(filter),
            Banner.countDocuments(filter),
            ServiceCategory.countDocuments(filter),
            ServiceType.countDocuments(filter),
            ServiceProvider.countDocuments(filter),
            Testimonial.countDocuments(filter)
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
            banners,
            serviceCategories,
            serviceTypes,
            serviceProviders,
            testimonials
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

