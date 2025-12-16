'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends ButtonProps {
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

/**
 * 標準化 Loading Button 組件
 * 
 * 使用方式：
 * ```tsx
 * <LoadingButton 
 *   isLoading={isSubmitting} 
 *   loadingText="處理中..."
 *   type="submit"
 * >
 *   提交
 * </LoadingButton>
 * ```
 */
export default function LoadingButton({
    isLoading = false,
    loadingText = '處理中...',
    children,
    disabled,
    className = '',
    ...props
}: LoadingButtonProps) {
    return (
        <Button
            disabled={isLoading || disabled}
            className={`relative transition-all ${className}`}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {loadingText}
                </span>
            ) : (
                children
            )}
        </Button>
    );
}
