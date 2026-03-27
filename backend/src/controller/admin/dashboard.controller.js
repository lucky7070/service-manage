import { Admin, City, Country, Role, State } from "../../models/index.js";

export const getDashboardStats = async (req, res) => {
    try {
        const filter = { deletedAt: null };

        const [roles, admins, countries, states, cities] = await Promise.all([
            Role.countDocuments(filter),
            Admin.countDocuments(filter),
            Country.countDocuments(filter),
            State.countDocuments(filter),
            City.countDocuments(filter)
        ]);

        return res.success({
            roles,
            admins,
            countries,
            states,
            cities
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

