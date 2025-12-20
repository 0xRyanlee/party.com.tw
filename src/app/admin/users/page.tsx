"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, Filter, MoreHorizontal,
    Shield, User, Mail, Calendar,
    ShieldAlert, RefreshCw, Star
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    full_name: string | null;
    email: string;
    role: "member" | "host" | "admin";
    avatar_url: string | null;
    created_at: string;
    user_tiers?: {
        tier: "free" | "plus" | "pro";
    };
}

export default function AdminUsersManagement() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [tierFilter, setTierFilter] = useState<string>("all");

    const supabase = createClient();

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Fetch profiles with their tiers
            const { data, error } = await supabase
                .from("profiles")
                .select(`
                    *,
                    user_tiers (
                        tier
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast.error("載入用戶失敗");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesTier = tierFilter === "all" || user.user_tiers?.tier === tierFilter;

            return matchesSearch && matchesRole && matchesTier;
        });
    }, [users, searchQuery, roleFilter, tierFilter]);

    const stats = useMemo(() => {
        return {
            total: users.length,
            hosts: users.filter(u => u.role === "host").length,
            plusUsers: users.filter(u => u.user_tiers?.tier === "plus" || u.user_tiers?.tier === "pro").length,
            admins: users.filter(u => u.role === "admin").length
        };
    }, [users]);

    const updateRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("id", userId);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
            toast.success("權限已更新");
        } catch (error: any) {
            console.error("Error updating role:", error);
            toast.error("更新失敗");
        }
    };

    const updateTier = async (userId: string, newTier: string) => {
        try {
            const { error } = await supabase
                .from("user_tiers")
                .update({ tier: newTier })
                .eq("user_id", userId);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, user_tiers: { tier: newTier as any } } : u));
            toast.success("會員等級已更新");
        } catch (error: any) {
            console.error("Error updating tier:", error);
            toast.error("更新失敗");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200"><Shield className="w-3 h-3 mr-1" /> 管理員</Badge>;
            case "host":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">主辦方</Badge>;
            default:
                return <Badge variant="outline" className="text-gray-500">一般成員</Badge>;
        }
    };

    const getTierBadge = (tier?: string) => {
        switch (tier) {
            case "pro":
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px]"><Star className="w-2 h-2 mr-1 fill-amber-500" /> PRO</Badge>;
            case "plus":
                return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200 text-[10px]">PLUS</Badge>;
            default:
                return <Badge variant="outline" className="text-gray-400 text-[10px]">FREE</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">用戶管理</h2>
                    <p className="text-gray-500 mt-1">管理平台上的所有註冊用戶</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        刷新
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[24px] border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
                        <User className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-[24px] border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">活躍主辦方</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.hosts}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-[24px] border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">付費會員</CardTitle>
                        <Star className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.plusUsers}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-[24px] border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">管理員</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & List */}
            <Card className="rounded-[24px] border-gray-100 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="搜尋姓名或 Email..."
                                className="pl-10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                className="h-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">所有權限</option>
                                <option value="member">一般成員</option>
                                <option value="host">主辦方</option>
                                <option value="admin">管理員</option>
                            </select>
                            <select
                                className="h-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                value={tierFilter}
                                onChange={(e) => setTierFilter(e.target.value)}
                            >
                                <option value="all">所有等級</option>
                                <option value="free">FREE</option>
                                <option value="plus">PLUS</option>
                                <option value="pro">PRO</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[80px]">頭像</TableHead>
                                    <TableHead>用戶資訊</TableHead>
                                    <TableHead>身份</TableHead>
                                    <TableHead>會員等級</TableHead>
                                    <TableHead>註冊日期</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            載入中...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            找不到相關用戶
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id} className="group">
                                            <TableCell>
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative">
                                                    {user.avatar_url ? (
                                                        <img
                                                            src={user.avatar_url}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <div className="font-medium truncate">{user.full_name || "未設置名稱"}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getRoleBadge(user.role)}
                                            </TableCell>
                                            <TableCell>
                                                {getTierBadge(user.user_tiers?.tier)}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl w-48">
                                                        <DropdownMenuLabel>管理操作</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel className="text-[10px] text-gray-400 font-normal uppercase px-2 py-1">更改身份</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => updateRole(user.id, "member")}>
                                                            設為 一般成員
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateRole(user.id, "host")}>
                                                            設為 主辦方
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateRole(user.id, "admin")}>
                                                            設為 管理員
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel className="text-[10px] text-gray-400 font-normal uppercase px-2 py-1">更改會員</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => updateTier(user.id, "free")}>
                                                            設為 FREE
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateTier(user.id, "plus")}>
                                                            設為 PLUS
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateTier(user.id, "pro")}>
                                                            設為 PRO
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
