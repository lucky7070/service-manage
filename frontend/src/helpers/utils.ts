import moment from "moment";
import { SweetAlertOptions } from "sweetalert2";

export function cn(...parts: Array<string | undefined | false | null>): string {
    return parts.filter(Boolean).join(" ");
}

export const resolveFileUrl = (fileName?: string | null) => {
    if (!fileName) return null;
    return fileName.startsWith("http") ? fileName : `${process.env.NEXT_PUBLIC_UPLOAD_URL}${fileName}`;
};

export function getSweetAlertConfig({
    title = 'Are you sure?',
    text = "This action cannot be undone.!",
    icon = 'warning',
    confirmButtonText = 'Yes, Delete',
    customClass = {},
    ...other
}: SweetAlertOptions) {
    return {
        title, text, icon, confirmButtonText,
        // buttonsStyling: false,
        showCancelButton: true,
        // confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        customClass: {
            // popup: 'p-3 m-0 d-flex flex-column gap-3 align-items-center',
            // title: 'h3 p-0 m-0',
            // icon: 'm-0 mx-auto',
            // htmlContainer: 'm-0 p-0 fs-0',
            // actions: 'm-0 p-0',
            // denyButton: 'btn btn-secondary',
            // confirmButton: 'btn btn-danger me-2',
            // closeButton: 'btn btn-secondary',
            // cancelButton: 'btn btn-secondary',
            // input: 'form-select m-0 bg-transprent',
            // container: '...',
            // image: '...',
            // input: '...',
            // inputLabel: '...',
            // validationMessage: '...',
            // loader: '...',
            // footer: '...',
            // timerProgressBar: '...',
            ...customClass
        },
        ...other
    }
}

export const momentHumanize = (eventDuration: number, unit: moment.DurationInputArg2 = "seconds") => {
    const eventMDuration = moment.duration(eventDuration, unit);
    const eventDurationArray = [];
    if (eventMDuration.years() > 0) {
        eventDurationArray.push(eventMDuration.years() + ' years');
        eventMDuration.subtract(eventMDuration.years(), 'years')
    }

    if (eventMDuration.months() > 0) {
        eventDurationArray.push(eventMDuration.months() + ' months');
        eventMDuration.subtract(eventMDuration.months(), 'months')
    }

    if (eventMDuration.weeks() > 0) {
        eventDurationArray.push(eventMDuration.weeks() + ' weeks');
        eventMDuration.subtract(eventMDuration.weeks(), 'weeks')
    }

    if (eventMDuration.days() > 0) {
        eventDurationArray.push(eventMDuration.days() + ' days');
        eventMDuration.subtract(eventMDuration.days(), 'days')
    }

    if (eventMDuration.hours() > 0) {
        eventDurationArray.push(eventMDuration.hours() + ' hours');
        eventMDuration.subtract(eventMDuration.hours(), 'hours')
    }

    if (eventMDuration.minutes() > 0) {
        eventDurationArray.push(eventMDuration.minutes() + ' minutes');
    }

    return eventDurationArray.length === 1 ? eventDurationArray[0] : eventDurationArray.join(' and ')
}