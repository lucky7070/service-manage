"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

type AddressLocationMapProps = {
    latitude: number | null;
    longitude: number | null;
    onChange: (latitude: number, longitude: number) => void;
};

const defaultCenter: [number, number] = [22.9734, 78.6569];

const markerIcon = L.divIcon({
    className: "",
    html: '<span class="block h-5 w-5 rounded-full border-2 border-white bg-indigo-600 shadow-lg ring-4 ring-indigo-500/25"></span>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

function MapSync({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, Math.max(map.getZoom(), 13));
    }, [center, map]);

    return null;
}

function ClickHandler({ onChange }: Pick<AddressLocationMapProps, "onChange">) {
    useMapEvents({
        click(event) {
            onChange(event.latlng.lat, event.latlng.lng);
        }
    });

    return null;
}

export default function AddressLocationMap({ latitude, longitude, onChange }: AddressLocationMapProps) {
    const hasPosition = latitude !== null && longitude !== null;
    const center = useMemo<[number, number]>(() => hasPosition ? [latitude, longitude] : defaultCenter, [hasPosition, latitude, longitude]);

    return (
        <MapContainer center={center} zoom={hasPosition ? 14 : 5} className="h-72 w-full rounded-xl border border-indigo-100 dark:border-slate-700" scrollWheelZoom>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapSync center={center} />
            <ClickHandler onChange={onChange} />
            {hasPosition ? (
                <Marker
                    draggable
                    icon={markerIcon}
                    position={center}
                    eventHandlers={{
                        dragend(event) {
                            const marker = event.target;
                            const position = marker.getLatLng();
                            onChange(position.lat, position.lng);
                        }
                    }}
                />
            ) : null}
        </MapContainer>
    );
}
