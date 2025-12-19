'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface QuickRegisterButtonProps {
    eventId: string;
    eventTitle?: string;
    isLoggedIn: boolean;
    isAlreadyRegistered?: boolean;
    onLoginRequired?: () => void;
    onSuccess?: () => void;
    size?: 'sm' | 'default' | 'lg';
    className?: string;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export default function QuickRegisterButton({
    eventId,
    eventTitle,
    isLoggedIn,
    isAlreadyRegistered = false,
    onLoginRequired,
    onSuccess,
    size = 'default',
    className = '',
}: QuickRegisterButtonProps) {
    const [state, setState] = useState<ButtonState>(
        isAlreadyRegistered ? 'success' : 'idle'
    );
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleClick = async () => {
        // 未登入則觸發登入流程
        if (!isLoggedIn) {
            onLoginRequired?.();
            return;
        }

        // 已報名則不做動作
        if (isAlreadyRegistered || state === 'success') {
            return;
        }

        setState('loading');
        setErrorMessage('');

        try {
            // 使用 Server Action 報名
            const { registerForEvent } = await import('@/app/actions/events');
            const result = await registerForEvent(eventId);

            if (result.success) {
                setState('success');
                const successMsg = result.checkin_code
                    ? `報名成功！簽到碼：${result.checkin_code}`
                    : result.message || 'Successfully registered!';
                toast.success(successMsg);
                onSuccess?.();
            } else {
                setState('error');
                setErrorMessage(result.message || 'Registration failed');
                toast.error(result.message);
                // 2秒後恢復 idle 狀態
                setTimeout(() => setState('idle'), 2000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setState('error');
            setErrorMessage('Network error. Please try again.');
            toast.error('Network error. Please try again.');
            setTimeout(() => setState('idle'), 2000);
        }
    };

    // 按鈕尺寸
    const sizeClasses = {
        sm: 'h-9 px-4 text-sm',
        default: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
    };

    // 狀態樣式
    const stateClasses = {
        idle: 'bg-black text-white hover:bg-zinc-800',
        loading: 'bg-zinc-600 text-white cursor-wait',
        success: 'bg-emerald-600 text-white',
        error: 'bg-red-600 text-white',
    };

    return (
        <Button
            onClick={handleClick}
            disabled={state === 'loading' || state === 'success'}
            className={`
                rounded-full font-bold transition-all duration-300
                ${sizeClasses[size]}
                ${stateClasses[state]}
                ${className}
            `}
        >
            <AnimatePresence mode="wait">
                {state === 'idle' && (
                    <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        {isLoggedIn ? 'Quick Register' : 'Login to Register'}
                    </motion.span>
                )}

                {state === 'loading' && (
                    <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registering...
                    </motion.span>
                )}

                {state === 'success' && (
                    <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Registered!
                    </motion.span>
                )}

                {state === 'error' && (
                    <motion.span
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4" />
                        Try Again
                    </motion.span>
                )}
            </AnimatePresence>
        </Button>
    );
}
