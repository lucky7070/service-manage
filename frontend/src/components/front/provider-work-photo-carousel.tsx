"use client";

import { ComponentPropsWithRef, useCallback, useEffect, useMemo, useState } from "react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";
import Image from "@/components/ui/Image";
import { resolveFileUrl } from "@/helpers/utils";

type ProviderWorkPhotoCarouselProps = {
    photos: string[];
    providerName: string;
    options?: EmblaOptionsType;
};

type UsePrevNextButtonsType = {
    prevBtnDisabled: boolean;
    nextBtnDisabled: boolean;
    onPrevButtonClick: () => void;
    onNextButtonClick: () => void;
};

type UseDotButtonType = {
    selectedIndex: number;
    scrollSnaps: number[];
    onDotButtonClick: (index: number) => void;
};

type ButtonProps = ComponentPropsWithRef<"button">;

const arrowButtonClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-white text-primary shadow-lg shadow-orange-100/70 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40";

export const usePrevNextButtons = (emblaApi: EmblaCarouselType | undefined): UsePrevNextButtonsType => {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    const onPrevButtonClick = useCallback(() => {
        emblaApi?.scrollPrev();
    }, [emblaApi]);

    const onNextButtonClick = useCallback(() => {
        emblaApi?.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setPrevBtnDisabled(!api.canScrollPrev());
        setNextBtnDisabled(!api.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("reInit", onSelect).on("select", onSelect);
        return () => {
            emblaApi.off("reInit", onSelect).off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    return {
        prevBtnDisabled: emblaApi ? !emblaApi.canScrollPrev() : prevBtnDisabled,
        nextBtnDisabled: emblaApi ? !emblaApi.canScrollNext() : nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick
    };
};

export const useDotButton = (emblaApi: EmblaCarouselType | undefined): UseDotButtonType => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onDotButtonClick = useCallback((index: number) => {
        emblaApi?.scrollTo(index);
    }, [emblaApi]);

    const onInit = useCallback((api: EmblaCarouselType) => {
        setScrollSnaps(api.scrollSnapList());
    }, []);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect);
        return () => {
            emblaApi.off("reInit", onInit).off("reInit", onSelect).off("select", onSelect);
        };
    }, [emblaApi, onInit, onSelect]);

    return { selectedIndex, scrollSnaps: scrollSnaps.length ? scrollSnaps : emblaApi?.scrollSnapList() ?? [], onDotButtonClick };
};


export function ProviderWorkPhotoCarousel({ photos, providerName, options = {} }: ProviderWorkPhotoCarouselProps) {
    const items = useMemo(() => photos.map((photo) => resolveFileUrl(photo)).filter((photo) => photo), [photos]);
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", ...options });
    const [modalIndex, setModalIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);
    const activePhoto = items[modalIndex] ?? null;

    const onModalPrev = useCallback(() => {
        if (items.length <= 1) return;
        setModalIndex((current) => (current === 0 ? items.length - 1 : current - 1));
    }, [items.length]);

    const onModalNext = useCallback(() => {
        if (items.length <= 1) return;
        setModalIndex((current) => (current === items.length - 1 ? 0 : current + 1));
    }, [items.length]);

    useEffect(() => {
        if (!modalOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setModalOpen(false);
            if (event.key === "ArrowLeft") onModalPrev();
            if (event.key === "ArrowRight") onModalNext();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [modalOpen, onModalNext, onModalPrev]);

    if (items.length === 0) return <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center text-gray-500">
        <ImageIcon className="mb-2 h-8 w-8" />
        <p>No work photos uploaded yet.</p>
    </div>

    return (
        <>
            <div className="space-y-4">
                <div className="relative">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="-ml-3 flex">
                            {items.map((photo, index) => (
                                <div key={index} className="min-w-0 flex-[0_0_86%] pl-3 sm:flex-[0_0_48%] lg:flex-[0_0_33.333%]">
                                    <div
                                        role="button"
                                        onClick={() => {
                                            setModalIndex(index);
                                            setModalOpen(true);
                                        }}
                                        className="group cursor-pointer block w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-sm transition hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/60"
                                        aria-label={`Open work photo ${index + 1}`}
                                    >
                                        <Image src={String(photo)} alt={`${providerName} work photo ${index + 1}`} className="aspect-4/3 w-full object-cover transition duration-300 group-hover:scale-105" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {items.length > 1 ? (
                        <>
                            <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} className="absolute -left-3 top-1/2 -translate-y-1/2" aria-label="Previous work photos" />
                            <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} className="absolute -right-3 top-1/2 -translate-y-1/2" aria-label="Next work photos" />
                        </>
                    ) : null}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                        {scrollSnaps.map((_, index) => <DotButton
                            key={index}
                            onClick={() => onDotButtonClick(index)}
                            className={`h-2.5 rounded-full transition-all ${index === selectedIndex ? "w-7 bg-primary" : "w-2.5 bg-orange-200 hover:bg-orange-300"}`}
                            aria-label={`Go to work photo set ${index + 1}`}
                        />)}
                    </div>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-primary">
                        {selectedIndex + 1} / {scrollSnaps.length || 1}
                    </span>
                </div>
            </div>

            {modalOpen && activePhoto ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" onClick={() => setModalOpen(false)}>
                    <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition hover:bg-white"
                        aria-label="Close photo viewer"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {items.length > 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onModalPrev();
                                }}
                                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition hover:bg-white"
                                aria-label="Previous work photo"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onModalNext();
                                }}
                                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition hover:bg-white"
                                aria-label="Next work photo"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    ) : null}

                    <div className="max-h-[90vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>
                        <Image src={activePhoto} alt={`${providerName} work photo ${modalIndex + 1}`} className="max-h-[90vh] w-auto rounded-2xl object-contain shadow-2xl" />
                        <p className="mt-3 text-center text-sm text-white/80">
                            {modalIndex + 1} of {items.length}
                        </p>
                    </div>
                </div>
            ) : null}
        </>
    );
}


export const PrevButton = ({ className = "", children, ...restProps }: ButtonProps) => (
    <button type="button" className={`${arrowButtonClass} ${className}`} {...restProps}>
        <ChevronLeft className="h-5 w-5" />
        {children}
    </button>
);

export const NextButton = ({ className = "", children, ...restProps }: ButtonProps) => (
    <button type="button" className={`${arrowButtonClass} ${className}`} {...restProps}>
        <ChevronRight className="h-5 w-5" />
        {children}
    </button>
);

export const DotButton = ({ children, ...restProps }: ButtonProps) => (
    <button type="button" {...restProps}>
        {children}
    </button>
);