'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedEventImageProps {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    priority?: boolean;
    sizes?: string;
}

/**
 * Optimized event image component with:
 * - Next.js Image optimization (auto format, lazy loading)
 * - Fallback placeholder on error
 * - Loading skeleton
 * - Proper sizing for thumbnails
 */
export default function OptimizedEventImage({
    src,
    alt,
    className = '',
    fill = true,
    width,
    height,
    priority = false,
    sizes = '(max-width: 768px) 96px, 128px',
}: OptimizedEventImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Fallback placeholder image
    const fallbackSrc = '/images/event-placeholder.svg';

    // Use fallback if error or no src
    const imageSrc = error || !src ? fallbackSrc : src;

    // Check if image is from allowed remote sources
    const isRemoteImage = imageSrc.startsWith('http');

    if (!isRemoteImage) {
        // Local image - use as-is
        return (
            <div className={`relative overflow-hidden ${className}`}>
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageSrc})` }}
                />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Loading skeleton */}
            {isLoading && (
                <div className="absolute inset-0 bg-zinc-200 animate-pulse" />
            )}

            <Image
                src={imageSrc}
                alt={alt}
                fill={fill}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                sizes={sizes}
                priority={priority}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setError(true);
                    setIsLoading(false);
                }}
                unoptimized={imageSrc.includes('.webp')} // WebP already optimized
            />
        </div>
    );
}
