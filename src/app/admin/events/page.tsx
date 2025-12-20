"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import {
    Card, CardContent, CardHeader, CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, Filter, Plus, MoreHorizontal,
    Trash2, Eye, Edit3, CheckCircle,
    XCircle, Calendar, Users, MapPin,
    AlertCircle, RefreshCw
} from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Event {
    id: string;
    title: string;
    status: string;
    start_time: string;
    category: string;
    cover_image: string | null;
    capacity_total: number | null;
    capacity_remaining: number | null;
    organizer_name: string;
    venue_name: string;
    created_at: string;
}

export default function AdminEventsManagement() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const supabase = createClient();

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (error: any) {
            console.error("Error fetching events:", error);
            toast.error("載入活動失敗");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || event.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [events, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: events.length,
            published: events.filter(e => e.status === "published").length,
            draft: events.filter(e => e.status === "draft").length,
            upcoming: events.filter(e => new Date(e.start_time) > new Date()).length
        };
    }, [events]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", deleteId);

            if (error) throw error;

            setEvents(prev => prev.filter(e => e.id !== deleteId));
            toast.success("活動已刪除");
        } catch (error: any) {
            console.error("Error deleting event:", error);
            toast.error("刪除失敗");
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "published" ? "draft" : "published";
        try {
            const { error } = await supabase
                .from("events")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            setEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
            toast.success(`狀態已變更為 ${newStatus === "published" ? "已發布" : "草稿"}`);
        } catch (error: any) {
            console.error("Error updating status:", error);
            toast.error("更新狀態失敗");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("zh-TW", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">已發布</Badge>;
            case "draft":
                return <Badge variant="outline" className="text-gray-500">草稿</Badge>;
            case "archived":
                return <Badge variant="secondary" className="text-gray-400">已封存</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">活動管理</h2>
                    <p className="text-gray-500 mt-1">管理平台上的所有活動內容</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchEvents} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        刷新
                    </Button>
                    <Button size="sm" asChild className="bg-black text-white rounded-full">
                        <Link href="/admin/events/new">
                            <Plus className="w-4 h-4 mr-2" />
                            發布活動
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[24px] border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">總活動數</CardTitle>
                        <Calendar className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-[24px] border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">已發布</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-[24px] border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">草稿</CardTitle>
                        <Edit3 className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-[24px] border-gray-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">即將開始</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
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
                                placeholder="搜尋活動標題..."
                                className="pl-10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                                className="h-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">所有狀態</option>
                                <option value="published">已發布</option>
                                <option value="draft">草稿</option>
                                <option value="archived">已封存</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[80px]">圖片</TableHead>
                                    <TableHead>活動標題</TableHead>
                                    <TableHead>主辦方</TableHead>
                                    <TableHead>日期時間</TableHead>
                                    <TableHead>狀態</TableHead>
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
                                ) : filteredEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            找不到相關活動
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEvents.map((event) => (
                                        <TableRow key={event.id} className="group">
                                            <TableCell>
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative">
                                                    {event.cover_image ? (
                                                        <img
                                                            src={event.cover_image}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Calendar className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[250px]">
                                                <div className="truncate" title={event.title}>{event.title}</div>
                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {event.venue_name || "未設定"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {event.organizer_name}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {formatDate(event.start_time)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(event.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl w-40">
                                                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/events/${event.id}`} target="_blank">
                                                                <Eye className="w-4 h-4 mr-2" /> 預覽
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/host/edit?id=${event.id}`}>
                                                                <Edit3 className="w-4 h-4 mr-2" /> 編輯
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => toggleStatus(event.id, event.status)}>
                                                            {event.status === "published" ? (
                                                                <>
                                                                    <XCircle className="w-4 h-4 mr-2 text-amber-500" /> 下架活動
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> 發布活動
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => setDeleteId(event.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" /> 刪除
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle>確定要刪除此活動嗎？</DialogTitle>
                        <DialogDescription>
                            此操作無法撤銷。這將永久刪除活動及其所有相關數據（如報名記錄）。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl">
                            取消
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "刪除中..." : "確定刪除"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
