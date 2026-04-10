"use client";

import DEFAULT_NOT_FOUND_SRC from "@/assets/images/no-image.jpg";

const Image = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, alt, onError, ...rest } = props;

    // eslint-disable-next-line @next/next/no-img-element
    return <img
        src={src}
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