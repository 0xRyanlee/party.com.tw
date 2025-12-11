import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
    return (
        <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className={`text-4xl font-serif italic tracking-tight ${className}`}>
                Party
            </span>
        </Link>
    );
}
