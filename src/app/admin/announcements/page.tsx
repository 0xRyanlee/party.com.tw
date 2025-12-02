"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const announcementSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().optional(),
    type: z.enum(["info", "warning", "alert"]),
    is_active: z.boolean(),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const supabase = createClient();

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: "",
            content: "",
            type: "info",
            is_active: true,
        },
    });

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("announcements")
            .select("*")
            .order("created_at", { ascending: false });

        if (data) setAnnouncements(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const onSubmit = async (values: AnnouncementFormValues) => {
        try {
            if (editingItem) {
                const { error } = await supabase
                    .from("announcements")
                    .update(values)
                    .eq("id", editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("announcements")
                    .insert(values);
                if (error) throw error;
            }

            setIsDialogOpen(false);
            setEditingItem(null);
            form.reset();
            fetchAnnouncements();
        } catch (error) {
            console.error("Error saving announcement:", error);
            alert("Failed to save announcement");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        try {
            const { error } = await supabase
                .from("announcements")
                .delete()
                .eq("id", id);

            if (error) throw error;
            fetchAnnouncements();
        } catch (error) {
            console.error("Error deleting announcement:", error);
            alert("Failed to delete announcement");
        }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        form.reset({
            title: item.title,
            content: item.content || "",
            type: item.type,
            is_active: item.is_active,
        });
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingItem(null);
        form.reset({
            title: "",
            content: "",
            type: "info",
            is_active: true,
        });
        setIsDialogOpen(true);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case "alert": return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openNew}>
                            <Plus className="mr-2 h-4 w-4" /> Add Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Announcement" : "New Announcement"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" {...form.register("title")} />
                                {form.formState.errors.title && (
                                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea id="content" {...form.register("content")} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <select
                                    id="type"
                                    {...form.register("type")}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="alert">Alert</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={form.watch("is_active")}
                                    onCheckedChange={(checked) => form.setValue("is_active", checked)}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((item) => (
                        <Card key={item.id} className={!item.is_active ? "opacity-60" : ""}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="mt-1">{getTypeIcon(item.type)}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{item.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 mt-1">{item.content}</p>
                                        </div>
                                        <div className="flex space-x-1">
                                            <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex gap-2 text-xs text-gray-500">
                                        <span className="capitalize px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border">
                                            {item.type}
                                        </span>
                                        {!item.is_active && (
                                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                                                Inactive
                                            </span>
                                        )}
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
