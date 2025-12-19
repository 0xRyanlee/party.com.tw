"use client";

import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { ImageMetadata } from '../host/ImageUploader';

interface StructuredImageProps extends Omit<ImageProps, 'alt'> {
    metadata?: ImageMetadata;
    alt?: string;
    size?: 'thumb' | 'card' | 'hero' | 'og';
    aspectRatio?: 'video' | 'square' | 'auto' | 'og';
}

const SIZE_MAP = {
    thumb: 300,
    card: 800,
    hero: 1600,
    og: 1200,
};

const ASPECT_MAP = {
    video: 'aspect-video',
    square: 'aspect-square',
    auto: 'aspect-auto',
    og: 'aspect-[1.91/1]', // 1200x630
};

export default function StructuredImage({
    src,
    metadata,
    alt: altOverride,
    size = 'card',
    aspectRatio = 'video',
    className,
    ...props
}: StructuredImageProps) {
    // Determine alt text: Override > Metadata Alt > Metadata Caption > empty
    const altText = altOverride || metadata?.alt || metadata?.caption || "";

    // Optimization: If it's a Supabase URL, we could potentially add transformation params here
    // but Next.js Image component already handles resizing if configured correctly in next.config.js

    // Fallback for empty src
    if (!src) {
        return (
            <div className={cn(
                "bg-zinc-100 flex items-center justify-center text-zinc-400",
                ASPECT_MAP[aspectRatio],
                className
            )}>
                <span className="text-xs">No image</span>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", ASPECT_MAP[aspectRatio], className)}>
            <Image
                src={src}
                alt={altText}
                width={SIZE_MAP[size]}
                height={aspectRatio === 'og' ? 630 : (SIZE_MAP[size] * (aspectRatio === 'square' ? 1 : 9 / 16))}
                className="object-cover w-full h-full transition-opacity duration-300"
                sizes={`(max-width: 768px) 100vw, ${SIZE_MAP[size]}px`}
                {...props}
            />
            {/* SEO LD+JSON for LLM friendliness - hidden but present in DOM */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "ImageObject",
                        "contentUrl": src,
                        "description": metadata?.caption || altText,
                        "name": altText,
                    }),
                }}
            />
        </div>
    );
}
