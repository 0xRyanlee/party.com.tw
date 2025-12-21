"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Ticket, Users, User } from "lucide-react";

const navItems = [
    { href: "/", icon: Home, label: "首頁" },
    { href: "/events", icon: Calendar, label: "活動" },
    { href: "/wallet", icon: Ticket, label: "票夾", special: true },
    { href: "/club", icon: Users, label: "社群" },
    { href: "/settings", icon: User, label: "我的" },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-[72px] px-4">
                {navItems.map((item) => {
                    const isActive = item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    // 票夾特殊樣式：深色背景
                    if (item.special) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center h-full gap-1 transition-all px-4 -mt-4 ${isActive ? "" : ""
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isActive
                                        ? 'bg-black text-white scale-110'
                                        : 'bg-neutral-800 text-white'
                                    }`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-medium ${isActive ? 'text-black' : 'text-gray-500'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center h-full gap-1 transition-colors ${isActive ? "text-black" : "text-gray-400"
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
