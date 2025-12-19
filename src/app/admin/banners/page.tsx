"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const bannerSchema = z.object({
    title: z.string().min(1, "請輸入標題"),
    image_url: z.string().url("請輸入有效的圖片網址"),
    link_url: z.string().url("請輸入有效的連結網址").optional().or(z.literal("")),
    display_order: z.number(),
    is_active: z.boolean(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

export default function BannersPage() {
    const [banners, setBanners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);
    const supabase = createClient();

    const form = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema),
        defaultValues: {
            title: "",
            image_url: "",
            link_url: "",
            display_order: 0,
            is_active: true,
        },
    });

    const fetchBanners = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("banners")
            .select("*")
            .order("display_order", { ascending: true });

        if (data) setBanners(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const onSubmit = async (values: BannerFormValues) => {
        try {
            if (editingBanner) {
                const { error } = await supabase
                    .from("banners")
                    .update(values)
                    .eq("id", editingBanner.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("banners")
                    .insert(values);
                if (error) throw error;
            }

            setIsDialogOpen(false);
            setEditingBanner(null);
            form.reset();
            fetchBanners();
        } catch (error) {
            console.error("Error saving banner:", error);
            alert("儲存失敗");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("確定要刪除此橫幅？")) return;

        try {
            const { error } = await supabase
                .from("banners")
                .delete()
                .eq("id", id);

            if (error) throw error;
            fetchBanners();
        } catch (error) {
            console.error("Error deleting banner:", error);
            alert("刪除失敗");
        }
    };

    const openEdit = (banner: any) => {
        setEditingBanner(banner);
        form.reset({
            title: banner.title,
            image_url: banner.image_url,
            link_url: banner.link_url || "",
            display_order: banner.display_order,
            is_active: banner.is_active,
        });
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingBanner(null);
        form.reset({
            title: "",
            image_url: "",
            link_url: "",
            display_order: 0,
            is_active: true,
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">輪播橫幅</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openNew}>
                            <Plus className="mr-2 h-4 w-4" /> 新增橫幅
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingBanner ? "編輯橫幅" : "新增橫幅"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">標題</Label>
                                <Input id="title" {...form.register("title")} />
                                {form.formState.errors.title && (
                                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image_url">圖片網址</Label>
                                <Input id="image_url" {...form.register("image_url")} />
                                {form.formState.errors.image_url && (
                                    <p className="text-sm text-red-500">{form.formState.errors.image_url.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="link_url">連結網址（選填）</Label>
                                <Input id="link_url" {...form.register("link_url")} />
                                {form.formState.errors.link_url && (
                                    <p className="text-sm text-red-500">{form.formState.errors.link_url.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="display_order">顯示順序</Label>
                                <Input type="number" id="display_order" {...form.register("display_order", { valueAsNumber: true })} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={form.watch("is_active")}
                                    onCheckedChange={(checked) => form.setValue("is_active", checked)}
                                />
                                <Label htmlFor="is_active">啟用</Label>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
                                <Button type="submit">儲存</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div>載入中...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {banners.map((banner) => (
                        <Card key={banner.id} className="overflow-hidden">
                            <div className="aspect-video w-full relative bg-gray-100 dark:bg-gray-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={banner.image_url}
                                    alt={banner.title}
                                    className="object-cover w-full h-full"
                                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=No+Image")}
                                />
                                {!banner.is_active && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                                        已停用
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold truncate">{banner.title}</h3>
                                        <p className="text-sm text-gray-500">順序: {banner.display_order}</p>
                                    </div>
                                    <div className="flex space-x-1">
                                        <Button size="icon" variant="ghost" onClick={() => openEdit(banner)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(banner.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {banner.link_url && (
                                    <a
                                        href={banner.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-500 flex items-center gap-1 hover:underline"
                                    >
                                        <ExternalLink className="h-3 w-3" /> 連結
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
