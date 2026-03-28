import { Admin, City, Country, Customer, Role, State } from "../../models/index.js";

export const getDashboardStats = async (req, res) => {
    try {
        const filter = { deletedAt: null };

        const [roles, admins, countries, states, cities, customers] = await Promise.all([
            Role.countDocuments(filter),
            Admin.countDocuments(filter),
            Country.countDocuments(filter),
            State.countDocuments(filter),
            City.countDocuments(filter),
            Customer.countDocuments(filter)
        ]);

        return res.success({
            roles,
            admins,
            countries,
            states,
            cities,
            customers
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

