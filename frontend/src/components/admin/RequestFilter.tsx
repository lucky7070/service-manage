import { Label, Input, Select, Option } from '@/components/ui';

type RequestFilterParam = Partial<{
    query: string;
    dateFrom: string;
    dateTo: string;
    status: string;
}>;

export default function RequestFilter({ statuses, value, onUpdate }: { statuses: string[], value: RequestFilterParam, onUpdate: (next: RequestFilterParam) => void }) {
    return <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-start gap-4">
        <div>
            <Label htmlFor="admin-query" className="text-xs">Search</Label>
            <Input
                value={value.query}
                onChange={(e) => onUpdate({ query: e.target.value })}
                placeholder="Search booking, customer, provider..."
            />
        </div>
        <div>
            <Label htmlFor="admin-date-from" className="text-xs">From</Label>
            <Input
                id="admin-date-from"
                type="date"
                value={value.dateFrom}
                onChange={(e) => onUpdate({ dateFrom: e.target.value })}
            />
        </div>
        <div>
            <Label htmlFor="admin-date-to" className="text-xs">To</Label>
            <Input
                id="admin-date-to"
                type="date"
                value={value.dateTo}
                onChange={(e) => onUpdate({ dateTo: e.target.value })}
            />
        </div>
        <div>
            <Label htmlFor="admin-status" className="text-xs">Status</Label>
            <Select value={value.status} onChange={(e) => onUpdate({ status: e.target.value })}>
                <Option value="">All statuses</Option>
                {statuses.map((status) => <Option key={status} value={status}>{status.replaceAll("_", " ")}</Option>)}
            </Select>
        </div>
    </div>
}