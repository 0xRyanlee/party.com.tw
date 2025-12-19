'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, Globe, LogOut, Calendar, Settings, User, Users, Ticket } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import AuthModal from '@/components/AuthModal';
import { useLanguage } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
    const { user, loading } = useUser();
    const { t, locale, setLocale } = useLanguage();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    // Navigation items with active state logic - 並列結構
    const navItems = [
        { href: '/', label: '首頁', matchExact: true },
        { href: '/events', label: '活動', matchExact: false },
        { href: '/wallet', label: '票夾', matchExact: true },
        { href: '/club', label: '社群', matchExact: false },
        { href: '/settings', label: '我的', matchExact: false },
    ];

    const isActive = (item: typeof navItems[0]) => {
        if (item.matchExact) {
            return pathname === item.href;
        }
        return pathname.startsWith(item.href);
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-16 gap-6">
                        {/* Logo + Tagline */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Logo />
                                <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                                    TAIWAN
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium tracking-wider pl-1">
                                城市活動行事曆
                            </p>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-medium transition-colors
                                        ${isActive(item)
                                            ? 'bg-black text-white hover:bg-gray-800'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Search Bar */}
                        <div className="relative w-64 hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜尋活動、地點..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 pl-9 pr-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                            />
                        </div>

                        {/* Language Switcher - Desktop Only */}
                        <button
                            onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
                            className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            <span>{locale === 'zh' ? '繁中' : 'EN'}</span>
                        </button>

                        {/* Auth Button / User Avatar */}
                        {!loading && (
                            <>
                                {user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                                                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56" align="end" forceMount>
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                                                    <p className="text-xs leading-none text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => router.push('/user/my-events')}>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                <span>我的活動</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push('/following')}>
                                                <Users className="mr-2 h-4 w-4" />
                                                <span>關注管理</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push('/settings')}>
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>設定</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>登出</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="rounded-full h-9 px-4 bg-black text-white hover:bg-gray-800 text-sm font-medium"
                                    >
                                        登入
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Create Event Button */}
                        <Link href="/host/edit">
                            <Button className="rounded-full w-9 h-9 bg-black text-white hover:bg-gray-800 flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}
