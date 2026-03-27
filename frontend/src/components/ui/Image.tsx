const Image = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />
}

export default Image