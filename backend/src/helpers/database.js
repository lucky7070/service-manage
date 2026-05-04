import { Setting } from "../models/index.js";

export const getSettings = async (settingNames = []) => {
    const rows = await Setting.find({ setting_name: { $in: settingNames }, status: 1 }, { setting_name: 1, filed_value: 1 });
    return rows.reduce((acc, row) => {
        const value = Number(row.filed_value || 0);
        acc[row.setting_name] = Number.isFinite(value) ? value : row.filed_value;
        return acc;
    }, {});
};