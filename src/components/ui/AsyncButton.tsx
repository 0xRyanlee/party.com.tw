"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
    children: React.ReactNode;
    loadingText?: string;
    successText?: string;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline';
}

export default function AsyncButton({
    onClick,
    children,
    loadingText = "Processing...",
    successText = "Success!",
    className,
    variant = 'primary',
    disabled,
    ...props
}: AsyncButtonProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (status !== 'idle' || disabled) return;

        if (onClick) {
            setStatus('loading');
            try {
                await onClick(e);
                setStatus('success');
                // Reset to idle or keep success state? 
                // For "Join Event", success state usually persists or changes to "Joined".
                // Here we'll keep success for a moment if needed, but the parent might handle the final state.
                // For this generic button, let's revert to idle after 2s if it's a transient action,
                // BUT for "Join Event" we usually want it to stay "Joined".
                // Let's assume the parent controls the "Joined" state via `disabled` or changing the button entirely.
                // This component handles the *transition* of the action.

                setTimeout(() => setStatus('idle'), 2000);
            } catch (error) {
                console.error(error);
                setStatus('idle'); // Revert on error
            }
        }
    };

    // Variant styles
    const variants = {
        primary: "bg-black text-white hover:bg-gray-800",
        secondary: "bg-emerald-500 text-white hover:bg-emerald-600",
        outline: "border-2 border-black text-black hover:bg-gray-50"
    };

    return (
        <button
            onClick={handleClick}
            disabled={status !== 'idle' || disabled}
            className={cn(
                "relative overflow-hidden rounded-full px-6 py-3 font-medium transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        >
            <AnimatePresence mode="wait" initial={false}>
                {status === 'idle' && (
                    <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2"
                    >
                        {children}
                    </motion.span>
                )}
                {status === 'loading' && (
                    <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2"
                    >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {loadingText}
                    </motion.span>
                )}
                {status === 'success' && (
                    <motion.span
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {successText}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
