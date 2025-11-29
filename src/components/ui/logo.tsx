export function Logo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <span className="text-4xl font-serif italic tracking-tight">Party</span>
            <span className="border border-current rounded-full px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase mt-1">
                Taiwan
            </span>
        </div>
    );
}
