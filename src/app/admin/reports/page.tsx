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
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Mail, MessageSquare, AlertTriangle, CheckCircle, XCircle, ExternalLink } from "lucide-react";

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

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("all");
    const supabase = createClient();
    const { toast } = useToast();

    const fetchReports = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("reports")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching reports:", error);
            toast({
                title: "Error",
                description: "Failed to fetch reports",
                variant: "destructive",
            });
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
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Report status updated",
            });
            setReports((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
            );
        }
    };

    const filteredReports = reports.filter((report) => {
        if (filterType === "all") return true;
        return report.type === filterType;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600 bg-yellow-50">Pending</Badge>;
            case "reviewed":
                return <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">Reviewed</Badge>;
            case "resolved":
                return <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">Resolved</Badge>;
            case "dismissed":
                return <Badge variant="outline" className="text-gray-600 border-gray-600 bg-gray-50">Dismissed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "report":
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case "feedback":
                return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case "collaboration":
                return <Mail className="w-4 h-4 text-purple-500" />;
            default:
                return <MessageSquare className="w-4 h-4" />;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading reports...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Report Center</h1>
                <Button onClick={fetchReports} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setFilterType}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="report">Reports</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                </TabsList>

                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredReports.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
                            No reports found in this category.
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <Card key={report.id} className="flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            {getTypeIcon(report.type)}
                                            {report.type}
                                        </div>
                                        {getStatusBadge(report.status)}
                                    </div>
                                    <CardTitle className="text-lg font-bold leading-tight">
                                        {report.category}
                                    </CardTitle>
                                    <CardDescription>
                                        {format(new Date(report.created_at), "PPP p")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 whitespace-pre-wrap">
                                        {report.description}
                                    </div>

                                    {report.contact_email && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600">
                                            <Mail className="w-4 h-4" />
                                            <a href={`mailto:${report.contact_email}`} className="hover:underline">
                                                {report.contact_email}
                                            </a>
                                        </div>
                                    )}

                                    {report.images && report.images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {report.images.map((img, idx) => (
                                                <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="shrink-0 relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity">
                                                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-3 border-t bg-gray-50/50">
                                    <Select
                                        defaultValue={report.status}
                                        onValueChange={(val) => updateStatus(report.id, val)}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="reviewed">Reviewed</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="dismissed">Dismissed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </Tabs>
        </div>
    );
}
