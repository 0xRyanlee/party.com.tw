"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard, Flag, Image as ImageIcon, Megaphone, Calendar,
    LogOut, Home, GripVertical, FlaskConical, Users, Shield,
    Building2, Bell, Ticket, BarChart3, FileText, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NavItem {
    id: string;
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    group: string;
}

interface NavGroup {
    id: string;
    label: string;
    items: NavItem[];
}

const defaultNavItems: NavItem[] = [
    // 概覽
    { id: 'dashboard', href: "/admin", label: "儀表板", icon: LayoutDashboard, group: "overview" },
    // 系統
    { id: 'tests', href: "/admin/tests", label: "系統測試", icon: FlaskConical, group: "system" },
    { id: 'logs', href: "/admin/logs", label: "操作日誌", icon: FileText, group: "system" },
    // 用戶
    { id: 'users', href: "/admin/users", label: "用戶列表", icon: Users, group: "users" },
    { id: 'kol', href: "/admin/users/kol", label: "KOL 審核", icon: Shield, group: "users" },
    { id: 'vendor', href: "/admin/users/vendor", label: "Vendor 審核", icon: Shield, group: "users" },
    // 內容
    { id: 'events', href: "/admin/events", label: "活動管理", icon: Calendar, group: "content" },
    { id: 'clubs', href: "/admin/clubs", label: "俱樂部管理", icon: Building2, group: "content" },
    { id: 'banners', href: "/admin/banners", label: "輪播橫幅", icon: ImageIcon, group: "content" },
    { id: 'announcements', href: "/admin/announcements", label: "系統公告", icon: Megaphone, group: "content" },
    { id: 'sensitive', href: "/admin/content/sensitive-words", label: "敏感詞管理", icon: Shield, group: "content" },
    // 營運
    { id: 'reports', href: "/admin/reports", label: "檢舉處理", icon: Flag, group: "operations" },
    { id: 'notifications', href: "/admin/notifications", label: "推播通知", icon: Bell, group: "operations" },
    { id: 'coupons', href: "/admin/coupons", label: "優惠碼管理", icon: Ticket, group: "operations" },
    // 數據
    { id: 'analytics', href: "/admin/analytics", label: "數據儀表板", icon: BarChart3, group: "data" },
];

const groupLabels: Record<string, string> = {
    overview: "📊 概覽",
    system: "🔬 系統",
    users: "👥 用戶",
    content: "📅 內容",
    operations: "🚨 營運",
    data: "📈 數據",
};

const STORAGE_KEY = 'admin_nav_order';
const AUTH_KEY = 'admin_authenticated';

// Sortable Nav Item
function SortableNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const Icon = item.icon;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-1 rounded-lg transition-colors ${isActive
                ? "bg-primary text-primary-foreground"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
        >
            <button
                {...attributes}
                {...listeners}
                className="p-1.5 cursor-grab active:cursor-grabbing hover:bg-black/5 rounded-l-lg"
            >
                <GripVertical className="h-3 w-3 text-gray-400" />
            </button>
            <Link href={item.href} className="flex items-center gap-2 px-2 py-2 flex-1 text-sm">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
            </Link>
        </div>
    );
}

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    // Load saved nav order
    useEffect(() => {
        const savedOrder = localStorage.getItem(STORAGE_KEY);
        if (savedOrder) {
            try {
                const orderIds = JSON.parse(savedOrder) as string[];
                const orderedItems = orderIds
                    .map(id => defaultNavItems.find(item => item.id === id))
                    .filter((item): item is NavItem => item !== undefined);
                const newItems = defaultNavItems.filter(item => !orderIds.includes(item.id));
                setNavItems([...orderedItems, ...newItems]);
            } catch {
                setNavItems(defaultNavItems);
            }
        }

        // Check authentication
        const authed = sessionStorage.getItem(AUTH_KEY);
        if (authed === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    // Check admin role
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/auth/login");
                return;
            }

            const isAdminEmail = user.email === 'ryan910814@gmail.com';
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (!isAdminEmail && profile?.role !== "admin") {
                router.push("/");
                return;
            }

            setIsAdmin(true);
            setIsLoading(false);
        };

        checkAdmin();
    }, [router, supabase]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setNavItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder.map(i => i.id)));
                return newOrder;
            });
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');

        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                sessionStorage.setItem(AUTH_KEY, 'true');
                setIsAuthenticated(true);
            } else {
                setPasswordError(data.error || '密碼錯誤');
            }
        } catch {
            setPasswordError('驗證失敗，請稍後再試');
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        sessionStorage.removeItem(AUTH_KEY);
        router.push("/auth/login");
    };

    // Group items
    const groupedItems = useMemo(() => {
        const groups: Record<string, NavItem[]> = {};
        navItems.forEach(item => {
            if (!groups[item.group]) groups[item.group] = [];
            groups[item.group].push(item);
        });
        return groups;
    }, [navItems]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAdmin) return null;

    // Password gate
    if (!isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Lock className="w-7 h-7 text-gray-600 dark:text-gray-300" />
                        </div>
                        <h1 className="text-xl font-bold">管理後台</h1>
                        <p className="text-sm text-gray-500 mt-1">請輸入管理密碼</p>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="管理密碼"
                            className="h-11"
                            autoFocus
                        />
                        {passwordError && (
                            <p className="text-sm text-red-500 text-center">{passwordError}</p>
                        )}
                        <Button type="submit" className="w-full h-11 rounded-xl" disabled={!password}>
                            進入管理後台
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-60 bg-white dark:bg-gray-800 shadow-md flex flex-col overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                    <h1 className="text-lg font-bold text-primary">管理後台</h1>
                </div>

                <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={navItems.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {Object.entries(groupLabels).map(([groupId, label]) => {
                                const items = groupedItems[groupId] || [];
                                if (items.length === 0) return null;

                                return (
                                    <div key={groupId}>
                                        <p className="text-xs text-gray-400 mb-1 px-2">{label}</p>
                                        <div className="space-y-0.5">
                                            {items.map((item) => (
                                                <SortableNavItem
                                                    key={item.id}
                                                    item={item}
                                                    isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </SortableContext>
                    </DndContext>
                </nav>

                <div className="p-3 border-t dark:border-gray-700 space-y-1.5">
                    <Link href="/">
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                            <Home className="h-3.5 w-3.5" />
                            返回網站
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        登出
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
