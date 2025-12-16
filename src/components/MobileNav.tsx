"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, Users, User } from "lucide-react";

const navItems = [
    { href: "/", icon: Home, label: "首頁" },
    { href: "/discover", icon: Compass, label: "探索" },
    { href: "/host/edit", icon: PlusCircle, label: "發佈", isCenter: true },
    { href: "/club", icon: Users, label: "社群" },
    { href: "/settings", icon: User, label: "我的" },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-[49px]">
                {navItems.map((item) => {
                    const isActive = item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    if (item.isCenter) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center justify-center w-12 h-12 -mt-4 bg-black rounded-full text-white shadow-lg active:scale-95 transition-transform"
                            >
                                <Icon className="w-6 h-6" />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive ? "text-black" : "text-gray-400"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
