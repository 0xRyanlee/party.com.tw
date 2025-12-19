"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, User } from "lucide-react";

const navItems = [
    { href: "/", icon: Home, label: "首頁" },
    { href: "/events", icon: Calendar, label: "活動" },
    { href: "/club", icon: Users, label: "社群" },
    { href: "/settings", icon: User, label: "我的" },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 md:hidden safe-area-bottom">
            <div className="flex items-center justify-center h-[72px] px-8">
                {navItems.map((item) => {
                    const isActive = item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors max-w-[80px] ${isActive ? "text-black" : "text-gray-400"
                                }`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
