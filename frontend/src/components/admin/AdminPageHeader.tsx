type AdminPageHeaderProps = {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
};

export default function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
                {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{subtitle}</p> : null}
            </div>
            {action ? <div>{action}</div> : null}
        </div>
    );
}
