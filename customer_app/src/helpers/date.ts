import moment from "moment";

export { moment };

export function parseDate(value?: string | Date | null) {
    if (value == null || value === "") return null;
    const parsed = moment(value);
    return parsed.isValid() ? parsed : null;
}

/** Date picker display — e.g. 19 May 2026 */
export function formatPickerDate(value: Date | null) {
    if (!value) return "Select date";
    return moment(value).format("DD MMM YYYY");
}

/** Send date-only value to API — YYYY-MM-DD */
export function toApiDate(value: Date) {
    return moment(value).format("YYYY-MM-DD");
}

/** e.g. 19 May 2026, 02:30 PM — booking detail, ledger */
export function formatDateTime(value?: string | Date | null, fallback = "—") {
    const parsed = parseDate(value);
    return parsed ? parsed.format("DD MMM YYYY, hh:mm A") : fallback;
}

/** e.g. 19 May, 02:30 PM — booking list rows */
export function formatDateTimeShort(value?: string | Date | null, fallback = "—") {
    const parsed = parseDate(value);
    return parsed ? parsed.format("DD MMM, hh:mm A") : fallback;
}

/** e.g. 19 May 2026 */
export function formatDate(value?: string | Date | null, fallback = "—") {
    const parsed = parseDate(value);
    return parsed ? parsed.format("DD MMM YYYY") : fallback;
}

/** e.g. May 19, 2026 — chat date groups */
export function formatDateLong(value?: string | Date | null, fallback = "Date unknown") {
    const parsed = parseDate(value);
    return parsed ? parsed.format("MMMM D, YYYY") : fallback;
}

/** e.g. 2:30 PM — chat message time */
export function formatTime(value?: string | Date | null) {
    const parsed = parseDate(value);
    return parsed ? parsed.format("h:mm A") : "";
}

export function formatDateKey(value?: string | Date | null) {
    const parsed = parseDate(value);
    return parsed ? parsed.format("YYYY-MM-DD") : "unknown";
}

/** Date/time picker display */
export function formatPickerDateTime(value: Date | null) {
    if (!value) return "Select date & time";
    return moment(value).format("ddd, DD MMM, hh:mm A");
}

/** Send to API as ISO string */
export function toApiDateTime(value: Date) {
    return moment(value).toISOString();
}

export function compareByDate(a?: string | null, b?: string | null) {
    const ta = parseDate(a)?.valueOf() ?? 0;
    const tb = parseDate(b)?.valueOf() ?? 0;
    return ta - tb;
}
