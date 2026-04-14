"use client";

import DEFAULT_NOT_FOUND_SRC from "@/assets/images/no-image.jpg";

const Image = ({ src, alt, onError, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => {

    // eslint-disable-next-line @next/next/no-img-element
    return <img
        src={src || String(DEFAULT_NOT_FOUND_SRC.src)}
        alt={alt || ""}
        onError={(e) => {
            onError?.(e);
            e.currentTarget.onerror = null;
            e.currentTarget.src = typeof DEFAULT_NOT_FOUND_SRC === "string" ? DEFAULT_NOT_FOUND_SRC : DEFAULT_NOT_FOUND_SRC.src;
        }}
        {...rest}
    />
};

export default Image;