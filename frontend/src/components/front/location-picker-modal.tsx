"use client"

import { useState } from "react"
import { MapPin, Search, Navigation, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const popularCities = [
    { name: "Bangalore", state: "Karnataka", popular: true },
    { name: "Mumbai", state: "Maharashtra", popular: true },
    { name: "Delhi", state: "NCR", popular: true },
    { name: "Chennai", state: "Tamil Nadu", popular: true },
    { name: "Hyderabad", state: "Telangana", popular: true },
    { name: "Pune", state: "Maharashtra", popular: true },
    { name: "Kolkata", state: "West Bengal", popular: false },
    { name: "Ahmedabad", state: "Gujarat", popular: false },
    { name: "Jaipur", state: "Rajasthan", popular: false },
    { name: "Lucknow", state: "Uttar Pradesh", popular: false },
    { name: "Chandigarh", state: "Punjab", popular: false },
    { name: "Kochi", state: "Kerala", popular: false },
]

interface LocationPickerModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCity: string | null
    onCitySelect: (city: string) => void
}

export function LocationPickerModal({
    open,
    onOpenChange,
    selectedCity,
    onCitySelect,
}: LocationPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredCities = popularCities.filter(
        (city) =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.state.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const popularCitiesList = filteredCities.filter((c) => c.popular)
    const otherCitiesList = filteredCities.filter((c) => !c.popular)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <MapPin className="h-5 w-5 text-primary" />
                        Select your city
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Choose your city to see services available in your area.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search for your city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 border-dashed text-primary hover:bg-primary/5 hover:text-primary"
                    >
                        <Navigation className="h-4 w-4" />
                        Use my current location
                    </Button>

                    <div className="max-h-[40vh] space-y-4 overflow-y-auto pr-2">
                        {popularCitiesList.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Popular Cities
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {popularCitiesList.map((city) => (
                                        <button
                                            key={city.name}
                                            onClick={() => onCitySelect(city.name)}
                                            className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-primary/5 ${selectedCity === city.name
                                                ? "border-primary bg-primary/10"
                                                : "border-border"
                                                }`}
                                        >
                                            <span className="font-medium text-foreground">{city.name}</span>
                                            <span className="text-xs text-muted-foreground">{city.state}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {otherCitiesList.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Other Cities
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {otherCitiesList.map((city) => (
                                        <button
                                            key={city.name}
                                            onClick={() => onCitySelect(city.name)}
                                            className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-primary/5 ${selectedCity === city.name
                                                ? "border-primary bg-primary/10"
                                                : "border-border"
                                                }`}
                                        >
                                            <span className="font-medium text-foreground">{city.name}</span>
                                            <span className="text-xs text-muted-foreground">{city.state}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredCities.length === 0 && (
                            <div className="py-8 text-center">
                                <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    No cities found for &quot;{searchQuery}&quot;
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
