"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ImageUploader from "@/components/host/ImageUploader";
import LocationPicker from "@/components/host/LocationPicker";
import { Calendar, MapPin, Link as LinkIcon, User, Tag, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Admin Event Schema - includes custom organizer fields
const adminEventSchema = z.object({
    title: z.string().min(3, "標題至少 3 個字元"),
    description: z.string().min(10, "描述至少 10 個字元"),
    type: z.string().min(1, "請選擇活動類型"),
    date: z.string().min(1, "請選擇日期"),
    time: z.string().min(1, "請選擇時間"),
    image: z.string().optional(),
    isPublic: z.boolean(),
    // Admin-specific fields
    customOrganizerName: z.string().min(1, "請填寫主辦方名稱"),
    sourceUrl: z.string().url().optional().or(z.literal("")),
    socialLinks: z.object({
        instagram: z.string().optional(),
        linkedin: z.string().optional(),
        threads: z.string().optional(),
    }),
    sourceTag: z.enum(["external", "public", "curated"]).optional(),
});

type AdminEventFormValues = z.infer<typeof adminEventSchema>;

export default function AdminEventsCreate() {
    const [location, setLocation] = useState<{ name: string; address: string; lat?: number; lng?: number }>({ name: '', address: '' });
    const [duration, setDuration] = useState(2);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<AdminEventFormValues>({
        resolver: zodResolver(adminEventSchema),
        defaultValues: {
            title: "",
            description: "",
            type: "event",
            isPublic: true,
            date: new Date().toISOString().split('T')[0],
            time: "18:00",
            customOrganizerName: "",
            sourceUrl: "",
            socialLinks: {
                instagram: "",
                linkedin: "",
                threads: "",
            },
            sourceTag: "curated",
        }
    });

    const onSubmit = async (data: AdminEventFormValues) => {
        try {
            // Prepare datetime
            const timeWithSeconds = data.time.length === 5 ? `${data.time}:00` : data.time;
            const startDate = new Date(`${data.date}T${timeWithSeconds}`);
            const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

            const eventPayload = {
                title: data.title,
                descriptionLong: data.description,
                descriptionShort: data.description.substring(0, 200),
                category: data.type,
                coverImage: data.image,
                venueName: location.name,
                address: location.address,
                gpsLat: location.lat,
                gpsLng: location.lng,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                tags: selectedTags,
                status: data.isPublic ? 'published' : 'draft',
                // Admin-specific fields
                customOrganizerName: data.customOrganizerName,
                sourceUrl: data.sourceUrl || null,
                socialLinks: data.socialLinks,
                sourceTag: data.sourceTag,
            };

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '建立活動失敗');
            }

            alert("活動已成功建立！");
        } catch (error: any) {
            alert(error.message || '儲存活動失敗');
        }
    };

    const availableTags = ['Tech', 'Music', 'Art', 'Sports', 'Food', 'Business', 'Social', 'Lifestyle'];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Admin 活動發布</h1>
                    <p className="text-sm text-gray-500">建立外部活動或公共活動</p>
                </div>
                <LoadingButton
                    onClick={handleSubmit(onSubmit)}
                    isLoading={isSubmitting}
                    loadingText="發布中..."
                    className="bg-black text-white rounded-full"
                >
                    發布活動
                </LoadingButton>
            </div>

            <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-[24px] border space-y-4">
                        <h2 className="text-lg font-bold">基本資訊</h2>

                        <div className="space-y-2">
                            <Label>活動標題 *</Label>
                            <Input {...register("title")} placeholder="活動名稱" />
                            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>活動描述 *</Label>
                            <Textarea {...register("description")} className="h-32" placeholder="活動詳情..." />
                            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>活動類型</Label>
                            <select
                                {...register("type")}
                                className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                            >
                                <option value="event">活動</option>
                                <option value="party">派對</option>
                                <option value="meetup">聚會</option>
                                <option value="workshop">工作坊</option>
                                <option value="conference">研討會</option>
                                <option value="exhibition">展覽</option>
                            </select>
                        </div>
                    </div>

                    {/* Custom Organizer */}
                    <div className="bg-white p-6 rounded-[24px] border space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <User className="w-5 h-5" /> 主辦方資訊
                        </h2>

                        <div className="space-y-2">
                            <Label>主辦方名稱 *</Label>
                            <Input {...register("customOrganizerName")} placeholder="例如：TechCrunch" />
                            {errors.customOrganizerName && <p className="text-xs text-red-500">{errors.customOrganizerName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>來源網址</Label>
                            <Input {...register("sourceUrl")} placeholder="https://..." />
                        </div>

                        <div className="space-y-2">
                            <Label>來源標籤</Label>
                            <div className="flex gap-2">
                                {['external', 'public', 'curated'].map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setValue("sourceTag", tag as any)}
                                        className={`px-4 py-2 rounded-full text-sm border transition-all ${watch("sourceTag") === tag
                                            ? "bg-black text-white"
                                            : "bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        {tag === 'external' ? '外部來源' : tag === 'public' ? '公共活動' : '精選活動'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-white p-6 rounded-[24px] border space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <ExternalLink className="w-5 h-5" /> 社群連結
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Instagram</Label>
                                <Input {...register("socialLinks.instagram")} placeholder="@username" />
                            </div>
                            <div className="space-y-2">
                                <Label>LinkedIn</Label>
                                <Input {...register("socialLinks.linkedin")} placeholder="profile URL" />
                            </div>
                            <div className="space-y-2">
                                <Label>Threads</Label>
                                <Input {...register("socialLinks.threads")} placeholder="@username" />
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white p-6 rounded-[24px] border space-y-4">
                        <h2 className="text-lg font-bold">封面圖片</h2>
                        <ImageUploader
                            value={watch("image")}
                            onChange={(val) => setValue("image", val)}
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Date & Time */}
                    <div className="bg-white p-6 rounded-[24px] border space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> 日期時間
                        </h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs">日期</Label>
                                <Input type="date" {...register("date")} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">時間</Label>
                                <Input type="time" {...register("time")} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">時長</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {[1, 2, 3, 4].map((h) => (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => setDuration(h)}
                                            className={`px-3 py-1 rounded-full text-sm border ${duration === h ? "bg-black text-white" : ""
                                                }`}
                                        >
                                            {h}h
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white p-6 rounded-[24px] border space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> 地點
                        </h3>
                        <LocationPicker value={location} onChange={setLocation} />
                    </div>

                    {/* Tags */}
                    <div className="bg-white p-6 rounded-[24px] border space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Tag className="w-4 h-4" /> 標籤
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag)
                                                ? prev.filter(t => t !== tag)
                                                : [...prev, tag]
                                        );
                                    }}
                                    className={`px-3 py-1 rounded-full text-sm border transition-all ${selectedTags.includes(tag)
                                        ? "bg-black text-white"
                                        : "bg-white hover:bg-gray-50"
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white p-6 rounded-[24px] border space-y-4">
                        <h3 className="font-bold">設定</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>公開活動</Label>
                                <p className="text-xs text-gray-500">所有人可見</p>
                            </div>
                            <Switch
                                checked={watch("isPublic")}
                                onCheckedChange={(val) => setValue("isPublic", val)}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
