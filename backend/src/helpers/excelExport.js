import ExcelJS from "exceljs";
import moment from "moment";

export const applyCreatedAtRange = (filter, dateFrom, dateTo) => {
    const from = String(dateFrom || "").trim();
    const to = String(dateTo || "").trim();
    if (!from && !to) return filter;

    const range = {};
    if (from && moment(from, "YYYY-MM-DD", true).isValid()) {
        range.$gte = moment(from).startOf("day").toDate();
    }
    if (to && moment(to, "YYYY-MM-DD", true).isValid()) {
        range.$lte = moment(to).endOf("day").toDate();
    }
    if (Object.keys(range).length) {
        filter.createdAt = { ...(filter.createdAt || {}), ...range };
    }
    return filter;
};

export const formatExportDate = (value) => (value ? moment(value).format("DD-MM-YYYY") : "");
export const formatExportDateTime = (value) => (value ? moment(value).format("DD-MM-YYYY hh:mm A") : "");

export const sendExcelResponse = async (res, { filename, sheetName = "Export", columns, rows }) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = columns.map((col) => ({ header: col.header, key: col.key, width: col.width || 18 }));
    sheet.getRow(1).font = { bold: true };
    rows.forEach((row) => sheet.addRow(row));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
};
