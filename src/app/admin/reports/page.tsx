"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
    Mail, MessageSquare, AlertTriangle, CheckCircle, XCircle,
    ExternalLink, RefreshCw, Filter, Clock, User
} from "lucide-react";

interface Report {
    id: string;
    type: string;
    category: string;
    description: string;
    contact_email: string | null;
    images: string[] | null;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    created_at: string;
    user_id: string | null;
}

const STATUS_CONFIG = {
    pending: { label: "待處理", color: "text-amber-600 border-amber-300 bg-amber-50", icon: Clock },
    reviewed: { label: "審核中", color: "text-blue-600 border-blue-300 bg-blue-50", icon: MessageSquare },
    resolved: { label: "已解決", color: "text-green-600 border-green-300 bg-green-50", icon: CheckCircle },
    dismissed: { label: "已駁回", color: "text-gray-600 border-gray-300 bg-gray-50", icon: XCircle },
};

const TYPE_CONFIG = {
    report: { label: "檢舉", icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-50" },
    feedback: { label: "意見反饋", icon: MessageSquare, color: "text-blue-500", bgColor: "bg-blue-50" },
    collaboration: { label: "合作洽談", icon: Mail, color: "text-purple-500", bgColor: "bg-purple-50" },
};

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const supabase = createClient();

    const fetchReports = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("reports")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching reports:", error);
            toast.error("載入回報失敗");
        } else {
            setReports(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from("reports")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast.error("更新狀態失敗");
        } else {
            toast.success("狀態已更新");
            setReports((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
            );
        }
    };

    const filteredReports = reports.filter((report) => {
        if (filterType !== "all" && report.type !== filterType) return false;
        if (filterStatus !== "all" && report.status !== filterStatus) return false;
        return true;
    });

    const getStats = () => {
        return {
            total: reports.length,
            pending: reports.filter(r => r.status === "pending").length,
            resolved: reports.filter(r => r.status === "resolved").length,
        };
    };

    const stats = getStats();

    const getStatusBadge = (status: keyof typeof STATUS_CONFIG) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        return (
            <Badge variant="outline" className={config.color}>
                {config.label}
            </Badge>
        );
    };

    const getTypeDisplay = (type: string) => {
        const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.feedback;
        const Icon = config.icon;
        return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bgColor}`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 頁面標題 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">回報中心</h1>
                    <p className="text-gray-500 mt-1">管理用戶反饋、檢舉與合作洽談</p>
                </div>
                <Button onClick={fetchReports} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新整理
                </Button>
            </div>

            {/* 統計卡片 */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-sm text-gray-500">總計回報</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-50">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className={stats.pending > 0 ? "border-amber-200 bg-amber-50/30" : ""}>
                    <CardContent className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-sm text-gray-500">待處理</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                        </div>
                        <div className="p-3 rounded-full bg-amber-50">
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-sm text-gray-500">已解決</p>
                            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-50">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 篩選器 */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">篩選：</span>
                </div>
                <Tabs defaultValue="all" onValueChange={setFilterType}>
                    <TabsList>
                        <TabsTrigger value="all">全部</TabsTrigger>
                        <TabsTrigger value="report">檢舉</TabsTrigger>
                        <TabsTrigger value="feedback">意見</TabsTrigger>
                        <TabsTrigger value="collaboration">合作</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="狀態" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部狀態</SelectItem>
                        <SelectItem value="pending">待處理</SelectItem>
                        <SelectItem value="reviewed">審核中</SelectItem>
                        <SelectItem value="resolved">已解決</SelectItem>
                        <SelectItem value="dismissed">已駁回</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 回報列表 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredReports.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <p className="text-gray-500">此分類沒有回報</p>
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <Card key={report.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    {getTypeDisplay(report.type)}
                                    {getStatusBadge(report.status)}
                                </div>
                                <CardTitle className="text-lg font-bold leading-tight">
                                    {report.category}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(report.created_at), "PPP p", { locale: zhTW })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                    {report.description}
                                </div>

                                {report.contact_email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <a
                                            href={`mailto:${report.contact_email}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {report.contact_email}
                                        </a>
                                    </div>
                                )}

                                {report.images && report.images.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {report.images.map((img, idx) => (
                                            <a
                                                key={idx}
                                                href={img}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity"
                                            >
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${img})` }}
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-3 border-t bg-gray-50/50">
                                <Select
                                    value={report.status}
                                    onValueChange={(val) => updateStatus(report.id, val)}
                                >
                                    <SelectTrigger className="w-full h-9">
                                        <SelectValue placeholder="更新狀態" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">待處理</SelectItem>
                                        <SelectItem value="reviewed">審核中</SelectItem>
                                        <SelectItem value="resolved">已解決</SelectItem>
                                        <SelectItem value="dismissed">已駁回</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
