"use client";

import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function HomeHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent">
            <Logo className="text-white scale-75 origin-left" />

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                    <Bell className="w-6 h-6" />
                </Button>
                <Avatar className="w-8 h-8 border-2 border-white/20">
                    <AvatarFallback className="bg-white/10 text-white text-xs">U</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
