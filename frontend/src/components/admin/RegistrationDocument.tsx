import { resolveFileUrl } from '@/helpers/utils';
import { ExternalLink } from 'lucide-react';
import Image from '@/components/ui/Image';

function RegistrationDocument({ label, path }: { label: string; path: string | File | null | undefined }) {
    const url = typeof path === "string" && path ? resolveFileUrl(path) : null;
    if (!url) {
        return (
            <div className="rounded-lg border border-dashed border-slate-200 p-3 dark:border-slate-600">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</p>
                <p className="mt-1 text-xs text-slate-400">Not uploaded</p>
            </div>
        );
    }

    const isPdf = /\.pdf($|\?)/i.test(url);
    return (
        <div className="rounded-lg border border-indigo-100 p-3 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</p>
            {isPdf ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open PDF
                </a>
            ) : (
                <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                    <Image src={url} alt={label} className="max-h-28 w-full rounded-md border border-slate-200 object-contain dark:border-slate-600" />
                </a>
            )}
        </div>
    );
}

export default RegistrationDocument