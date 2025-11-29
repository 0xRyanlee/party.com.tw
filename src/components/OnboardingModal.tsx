"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { X } from "lucide-react";

interface OnboardingModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

function NotificationCard({ title, message, time }: { title: string; message: string; time?: string }) {
    return (
        <div className="bg-[#2C2C2E] rounded-2xl p-4 flex gap-3 items-start mb-3 w-full max-w-sm mx-auto shadow-lg">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                <Logo className="scale-50 text-black" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm text-white">{title}</h4>
                    {time && <span className="text-xs text-gray-400">{time}</span>}
                </div>
                <p className="text-sm text-gray-300 mt-0.5 leading-tight">{message}</p>
            </div>
        </div>
    );
}

export default function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange?.(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white text-black rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 pb-12 animate-in slide-in-from-bottom duration-500 shadow-2xl">
                <button
                    onClick={() => onOpenChange?.(false)}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-6 h-6 text-gray-400" />
                </button>

                <div className="flex flex-col items-center text-center pt-4">

                    {/* Title Section */}
                    <div className="mb-8 space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Don't Miss Out
                            <br />
                            The Night is Young
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                            Discover the best parties, meetups, and events happening right now in Taipei.
                        </p>
                    </div>

                    {/* Notification Preview (Visual Element) */}
                    <div className="mb-8 w-full relative">
                        <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent z-10" />
                        <NotificationCard
                            title="Upcoming Event"
                            message="Tech Networking Night is starting in 1 hour!"
                            time="Now"
                        />
                        <NotificationCard
                            title="New Recommendation"
                            message="Based on your interests, you might like 'Rooftop Jazz'."
                            time="2m ago"
                        />
                    </div>

                    {/* Action Button */}
                    <Button
                        className="w-full h-14 rounded-full text-lg font-medium bg-black text-white hover:bg-gray-900 mt-2"
                        onClick={() => onOpenChange?.(false)}
                    >
                        Get Started
                    </Button>
                </div>
            </div>
        </div>
    );
}
