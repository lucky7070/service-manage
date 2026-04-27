"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import axios from "axios";
import { Button, Input, Label } from "@/components/ui";

const AddressLocationMap = dynamic(() => import("@/components/admin/AddressLocationMap"), {
    ssr: false,
    loading: () => <div className="flex h-72 items-center justify-center rounded-xl border border-indigo-100 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">Loading map...</div>
});

type AddressLocationPickerProps = {
    latitude: string;
    longitude: string;
    searchHint?: string;
    onChange: (latitude: string, longitude: string) => void;
};

type NominatimResult = {
    display_name: string;
    lat: string;
    lon: string;
};

const toCoordinate = (value: string) => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatCoordinate = (value: number) => value.toFixed(6);

export default function AddressLocationPicker({ latitude, longitude, searchHint = "", onChange }: AddressLocationPickerProps) {
    const [query, setQuery] = useState(searchHint);
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const lat = useMemo(() => toCoordinate(latitude), [latitude]);
    const lng = useMemo(() => toCoordinate(longitude), [longitude]);

    const searchLocation = async () => {
        const trimmed = query.trim();
        if (!trimmed) {
            setError("Enter a location to search.");
            return;
        }

        setLoading(true);
        setError("");
        setResults([]);

        try {
            const { data } = await axios.get<NominatimResult[]>("https://nominatim.openstreetmap.org/search", {
                params: {
                    q: trimmed,
                    format: "json",
                    limit: 5,
                    addressdetails: 1,
                    countrycodes: "in"
                },
                headers: { Accept: "application/json" }
            });
            setResults(Array.isArray(data) ? data : []);
            if (!Array.isArray(data) || data.length === 0) {
                setError("No location found. Try a more specific address.");
            }
        } catch {
            setError("Could not search location right now.");
        } finally {
            setLoading(false);
        }
    };

    const applyLocation = (result: NominatimResult) => {
        onChange(formatCoordinate(Number(result.lat)), formatCoordinate(Number(result.lon)));
        setQuery(result.display_name);
        setResults([]);
    };

    return (
        <div className="space-y-3 rounded-xl border border-indigo-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="space-y-2">
                <Label htmlFor="address-location-search">Search Location On Map</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        id="address-location-search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                void searchLocation();
                            }
                        }}
                        placeholder="Search house, area, city..."
                    />
                    <Button type="button" variant="secondary" onClick={() => void searchLocation()} disabled={loading}>
                        <Search className="h-4 w-4" />
                        {loading ? "Searching..." : "Search"}
                    </Button>
                </div>
                {error ? <small className="block text-xs text-rose-600">{error}</small> : null}
            </div>

            {results.length > 0 ? (
                <div className="space-y-1 rounded-lg border border-indigo-100 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
                    {results.map((result) => (
                        <button
                            key={`${result.lat}-${result.lon}-${result.display_name}`}
                            type="button"
                            className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => applyLocation(result)}
                        >
                            <LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                            <span>{result.display_name}</span>
                        </button>
                    ))}
                </div>
            ) : null}

            <AddressLocationMap
                latitude={lat}
                longitude={lng}
                onChange={(nextLat, nextLng) => onChange(formatCoordinate(nextLat), formatCoordinate(nextLng))}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Search a location, then drag the marker or click the map to adjust exact latitude and longitude.</p>
        </div>
    );
}
