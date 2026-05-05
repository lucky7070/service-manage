"use client";

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Search, WalletCards } from "lucide-react";
import { toast } from "react-toastify";

import AccountNav from "@/components/front/user/AccountNav";
import { Button, Input, Select } from "@/components/front/ui";
import AxiosHelper from "@/helpers/AxiosHelper";
import { useAppSelector } from "@/store/hooks";

type LedgerRow = {
    _id: string;
    voucherNo: string;
    amount: number;
    currentBalance: number;
    updatedBalance: number;
    paymentType: 1 | 2;
    paymentMethod: 1 | 2 | 3 | 4 | 5 | 6;
    particulars?: string | null;
    createdAt?: string;
};

type LedgerCustomer = {
    name?: string;
    mobile?: string;
    balance?: number;
    referralCode?: string;
};

type LedgerData = {
    record: LedgerRow[];
    count: number;
    totalPages: number;
    current_page: number;
    customer?: LedgerCustomer;
};

export default function CustomerLedgerPage() {

    const user = useAppSelector((state) => state.user);
    const [data, setData] = useState<LedgerData>({ record: [], count: 0, totalPages: 0, current_page: 1 });
    const [params, setParams] = useState({ pageNo: 1, paymentType: "", query: "" });
    const [loading, setLoading] = useState(true);

    const getData = useCallback(async () => {
        setLoading(true);
        const { data, status } = await AxiosHelper.getData("/customer/ledger", params);
        if (data.status) {
            setData(data.data as LedgerData);
        } else if (status === 404) {
            setData((prev) => ({ ...prev, record: [], count: 0, totalPages: 0, current_page: 1 }));
        } else {
            toast.error(data.message || "Could not load ledger.");
        }

        setLoading(false);
    }, [params]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void getData(); }, 0);
        return () => window.clearTimeout(timer);
    }, [getData]);

    return (
        <section className="bg-muted/30 py-10">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountNav />
                    <div className="min-w-0 space-y-5">
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="">
                                    <h1 className="text-2xl font-bold">My Ledger</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">View wallet credits, debits, rewards, and referral bonuses.</p>
                                </div>
                                <div className="rounded-2xl bg-primary/10 px-5 py-3 text-primary">
                                    <p className="text-xs font-semibold uppercase tracking-wide">Current Balance</p>
                                    <p className="mt-1 text-2xl font-bold">₹{(user.balance || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input value={params.query} onChange={(event) => setParams((prev) => ({ ...prev, query: String(event.target.value).trim(), pageNo: 1 }))} className="pl-10" placeholder="Search voucher or particulars..." />
                                </div>
                                <Select value={params.paymentType} onChange={(event) => { setParams((prev) => ({ ...prev, paymentType: event.target.value, pageNo: 1 })); }} className="lg:max-w-[180px]">
                                    <option value="">All entries</option>
                                    <option value="1">Credit</option>
                                    <option value="2">Debit</option>
                                </Select>
                            </div>

                            {loading ? <p className="py-8 text-center text-muted-foreground">Loading ledger...</p> : null}
                            {!loading && data.record.length === 0 ? <p className="py-8 text-center text-muted-foreground">No ledger entries found.</p> : null}

                            <div className="space-y-3">
                                {data.record.map((row) => (
                                    <div key={row._id} className="rounded-2xl border border-border bg-background p-3 shadow-sm sm:p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <WalletCards className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold">{row.voucherNo || "—"}</p>
                                                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.particulars || "N/A"}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2 sm:block sm:bg-transparent sm:px-0 sm:py-0 sm:text-right">
                                                        <p className={`text-base font-bold sm:text-lg ${row.paymentType === 1 ? "text-emerald-600" : "text-rose-600"}`}>
                                                            {row.paymentType === 1 ? "+" : "-"} ₹{Number(row.amount || 0).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground sm:text-sm">
                                                    Date: {row.createdAt ? moment(row.createdAt).format("DD MMM YYYY, hh:mm A") : "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {data.totalPages > 1 && !loading && data.record.length > 0 ? (
                                <div className="mt-5 flex justify-end gap-2">
                                    <Button type="button" variant="outline" disabled={params.pageNo <= 1} onClick={() => setParams((prev) => ({ ...prev, pageNo: Math.max(prev.pageNo - 1, 1) }))}>Previous</Button>
                                    <Button type="button" variant="outline" disabled={params.pageNo >= data.totalPages} onClick={() => setParams((prev) => ({ ...prev, pageNo: prev.pageNo + 1 }))}>Next</Button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
