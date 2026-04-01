"use client";

import { type DragEvent, type MouseEvent, type ReactNode, useRef } from "react";

export type SortableListProps<T> = {
    list: T[];
    setList: (next: T[]) => void;
    getId: (item: T) => string;
    renderItem: (item: T, index: number) => ReactNode;
    className?: string;
    tag?: "ul" | "div" | "ol";
    handleClassName?: string;
    disabled?: boolean;
    onEnd?: (next: T[]) => void;
};

export default function SortableList<T>({
    list,
    setList,
    getId,
    renderItem,
    className,
    tag = "ul",
    handleClassName = "drag-handle",
    disabled = false,
    onEnd
}: SortableListProps<T>) {
    const dragIdRef = useRef<string | null>(null);
    const allowDragRef = useRef(false);

    const reorder = (fromId: string, toId: string) => {
        if (fromId === toId) return;
        const fromIndex = list.findIndex((item) => getId(item) === fromId);
        const toIndex = list.findIndex((item) => getId(item) === toId);
        if (fromIndex < 0 || toIndex < 0) return;

        const next = [...list];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        setList(next);
        onEnd?.(next);
    };

    const onItemDragStart = (e: DragEvent, id: string) => {
        if (disabled) return;
        if (handleClassName && !allowDragRef.current) {
            e.preventDefault();
            return;
        }

        dragIdRef.current = id;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
    };

    const onItemMouseDownCapture = (e: MouseEvent) => {
        if (!handleClassName) {
            allowDragRef.current = true;
            return;
        }

        const target = e.target as HTMLElement | null;
        allowDragRef.current = !!target?.closest(`.${handleClassName}`);
    };

    const onItemDrop = (e: DragEvent, targetId: string) => {
        e.preventDefault();
        if (disabled) return;

        const fromId = dragIdRef.current;
        dragIdRef.current = null;
        if (!fromId) return;
        
        reorder(fromId, targetId);
    };

    const onItemDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const onItemDragEnd = () => {
        allowDragRef.current = false;
    };

    const ContainerTag = tag;

    return <ContainerTag className={className}>
        {list.map((item, index) => {
            const id = getId(item);
            return <div
                key={id}
                onDragOver={onItemDragOver}
                onDrop={(e) => onItemDrop(e, id)}
            >
                <div
                    draggable={!disabled}
                    onMouseDownCapture={onItemMouseDownCapture}
                    onDragStart={(e) => onItemDragStart(e, id)}
                    onDragEnd={onItemDragEnd}
                >
                    {renderItem(item, index)}
                </div>
            </div>;
        })}
    </ContainerTag>;
}
