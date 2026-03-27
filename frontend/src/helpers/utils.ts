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