'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useUser } from '@/hooks/useUser';
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
import { User, LogOut, Calendar, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { useState } from 'react';

export default function Navbar() {
    const { t } = useLanguage();
    const { user, loading } = useUser();
    const router = useRouter();
    const supabase = createClient();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const handleHostClick = (e: React.MouseEvent) => {
        if (!user && !loading) {
            e.preventDefault();
            setIsAuthModalOpen(true);
        }
    };

    return (
        <nav className="flex items-center gap-2 sm:gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide w-full">
            <Link href="/" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black text-white text-xs sm:text-sm font-medium whitespace-nowrap">
                {t('nav.home')}
            </Link>

            <Link
                href="/host/dashboard"
                onClick={handleHostClick}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-gray-100 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap transition-colors"
            >
                {t('nav.host')}
            </Link>

            <Link href="/club" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-gray-100 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap transition-colors">
                {t('nav.club')}
            </Link>

            <Link href="/settings" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-gray-100 text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap transition-colors">
                {t('nav.settings')}
            </Link>

            <div className="ml-auto flex items-center gap-3">
                <LanguageSwitcher />

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
                                size="sm"
                                className="rounded-full bg-black text-white hover:bg-gray-800"
                                onClick={() => setIsAuthModalOpen(true)}
                            >
                                登入
                            </Button>
                        )}
                    </>
                )}
            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </nav>
    );
}
