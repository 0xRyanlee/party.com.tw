"use client";

import { useState } from 'react';
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import TicketManager from "@/components/host/TicketManager";
import ImageUploader from "@/components/host/ImageUploader";
import CollaborationStep from "@/components/CollaborationStep";
import ParticipantSettings from "@/components/host/ParticipantSettings";
import CustomTags from "@/components/host/CustomTags";
import AdvancedTicketManager from "@/components/host/AdvancedTicketManager";
import LocationPicker from "@/components/host/LocationPicker";
import { Calendar, MapPin, Clock, Info, Tag, Briefcase } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { EventRole, EventResource } from "@/types/schema";

// Zod Schema
const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    type: z.string().min(1, "Please select an event type"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    locationName: z.string().min(1, "Location name is required"),
    address: z.string().min(1, "Address is required"),
    image: z.string().optional(),
    isPublic: z.boolean(),
    externalLink: z.string().url().optional().or(z.literal("")),
    tickets: z.array(z.object({
        name: z.string().min(1, "Ticket name is required"),
        price: z.number().min(0, "Price cannot be negative"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
    })),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function HostEdit() {
    const { t } = useLanguage();

    // Collaboration state
    const [roles, setRoles] = useState<Omit<EventRole, 'id' | 'eventId' | 'createdAt'>[]>([]);
    const [resources, setResources] = useState<Omit<EventResource, 'id' | 'eventId' | 'createdAt'>[]>([]);

    // Event attributes state
    const [capacity, setCapacity] = useState(50);
    const [invitationOnly, setInvitationOnly] = useState(false);
    const [isAdultOnly, setIsAdultOnly] = useState(false);
    const [invitationCode, setInvitationCode] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [advancedTickets, setAdvancedTickets] = useState<any[]>([]);
    const [duration, setDuration] = useState(2); // 活動時長（小時）
    const [location, setLocation] = useState<{ name: string; address: string; lat?: number; lng?: number }>({ name: '', address: '' });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            description: "",
            type: "party",
            isPublic: true,
            tickets: [],
            date: new Date().toISOString().split('T')[0],
            time: "18:00",
            locationName: "",
            address: "",
            externalLink: "",
        }
    });

    const onSubmit = async (data: EventFormValues) => {
        try {
            console.log("Submitting Event Data:", data);

            // 驗證並準備日期時間
            let startTime: string;
            let endTime: string;

            try {
                // 組合日期和時間
                if (!data.date || !data.time) {
                    throw new Error('請選擇活動日期和時間');
                }

                // Ensure time has seconds for consistent ISO parsing
                const timeWithSeconds = data.time.length === 5 ? `${data.time}:00` : data.time;
                const dateTimeString = `${data.date}T${timeWithSeconds}`;
                const startDate = new Date(dateTimeString);

                // 驗證日期是否有效
                if (isNaN(startDate.getTime())) {
                    throw new Error('無效的日期或時間格式');
                }

                startTime = startDate.toISOString();

                // 計算結束時間（基於活動時長）
                const durationInHours = Number(duration) || 2;
                const endDate = new Date(startDate.getTime() + durationInHours * 60 * 60 * 1000);
                endTime = endDate.toISOString();
            } catch (dateError: any) {
                console.error("Date parsing error:", dateError);
                alert(`日期時間錯誤: ${dateError.message}`);
                return;
            }

            // 準備活動資料
            const eventPayload = {
                title: data.title,
                descriptionLong: data.description,
                descriptionShort: data.description.substring(0, 200),
                category: data.type,
                coverImage: data.image,
                venueName: location.name || data.locationName,
                address: location.address || data.address,
                gpsLat: location.lat,
                gpsLng: location.lng,
                startTime,
                endTime,
                ticketTypes: advancedTickets,
                capacityTotal: capacity,
                isAdultOnly,
                invitationOnly,
                invitationCode: invitationOnly ? invitationCode : null,
                tags: selectedTags,
                status: data.isPublic ? 'published' : 'draft',
                externalLink: data.externalLink || null,
            };

            // 創建活動
            const eventResponse = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventPayload),
            });

            if (!eventResponse.ok) {
                const errorData = await eventResponse.json();
                throw new Error(errorData.error || 'Failed to create event');
            }

            const { event } = await eventResponse.json();
            console.log('Event created:', event);

            // 保存角色需求
            if (roles.length > 0) {
                const rolesResponse = await fetch(`/api/events/${event.id}/roles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roles }),
                });

                if (!rolesResponse.ok) {
                    console.error('Failed to save roles');
                }
            }

            // 保存資源需求
            if (resources.length > 0) {
                const resourcesResponse = await fetch(`/api/events/${event.id}/resources`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resources }),
                });

                if (!resourcesResponse.ok) {
                    console.error('Failed to save resources');
                }
            }

            alert("活動已成功建立！");
            // TODO: 導航到活動詳情頁或主辦方儀表板
        } catch (error: any) {
            console.error('Error saving event:', error);
            alert(error.message || '儲存活動失敗，請稍後再試');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header Actions */}
            <div className="flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-sm py-4 z-10 -mx-4 px-4 md:mx-0 md:px-0">
                <div>
                    <h1 className="text-2xl font-bold">{t('host.edit.title')}</h1>
                    <p className="text-sm text-gray-500">建立或編輯您的活動詳情</p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="rounded-full">放棄</Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-black text-white rounded-full min-w-[120px]">
                        {isSubmitting ? "儲存中..." : "發佈活動"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Info Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">
                                <Info className="w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-bold">{t('host.edit.basicInfo')}</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>活動標題</Label>
                                <Input
                                    {...register("title")}
                                    placeholder="例如：夏日泳池派對"
                                    className="text-lg font-medium"
                                />
                                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>活動描述</Label>
                                <Textarea
                                    {...register("description")}
                                    className="h-32 resize-none"
                                    placeholder="告訴大家您的活動內容..."
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>活動類型</Label>
                                <select
                                    {...register("type")}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="party">派對</option>
                                    <option value="meetup">小聚</option>
                                    <option value="workshop">工作坊</option>
                                    <option value="gathering">聚會</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>外部連結（選填）</Label>
                                <Input
                                    {...register("externalLink")}
                                    placeholder="https://..."
                                    type="url"
                                />
                                <p className="text-xs text-gray-500">可填入報名連結、活動頁面或社群連結</p>
                                {errors.externalLink && <p className="text-xs text-red-500">{errors.externalLink.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">
                                <Tag className="w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-bold">{t('host.edit.media')}</h2>
                        </div>
                        <ImageUploader
                            value={watch("image")}
                            onChange={(val) => setValue("image", val)}
                        />
                    </div>

                    {/* Advanced Tickets Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                        <AdvancedTicketManager
                            tickets={advancedTickets}
                            onTicketsChange={setAdvancedTickets}
                        />
                    </div>

                    {/* Participant Settings Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                        <ParticipantSettings
                            capacityTotal={capacity}
                            isAdultOnly={isAdultOnly}
                            invitationOnly={invitationOnly}
                            invitationCode={invitationCode}
                            onCapacityChange={setCapacity}
                            onAdultOnlyChange={setIsAdultOnly}
                            onInvitationOnlyChange={setInvitationOnly}
                            onInvitationCodeChange={setInvitationCode}
                        />
                    </div>

                    {/* Custom Tags Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                        <CustomTags
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                        />
                    </div>

                    {/* Collaboration Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-bold">合作招募</h2>
                        </div>
                        <CollaborationStep
                            roles={roles}
                            resources={resources}
                            onRolesChange={setRoles}
                            onResourcesChange={setResources}
                        />
                    </div>
                </div>

                {/* Right Column: Sidebar Details */}
                <div className="space-y-6">

                    {/* Date & Time */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" /> 日期時間
                        </h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">活動日期</Label>
                                <Input type="date" {...register("date")} />
                                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">開始時間</Label>
                                <Input type="time" {...register("time")} />
                                {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">活動時長</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 6, 8].map((hours) => (
                                        <button
                                            key={hours}
                                            type="button"
                                            onClick={() => setDuration(hours)}
                                            className={`w-14 px-3 py-2 rounded-full border text-sm font-medium transition-all ${duration === hours
                                                ? 'border-gray-900 bg-gray-100 text-gray-900'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {hours}h
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={duration}
                                    onChange={(e) => setDuration(parseFloat(e.target.value) || 2)}
                                    placeholder="或輸入自定義時長"
                                    className="text-sm"
                                />
                                <p className="text-xs text-gray-500">
                                    結束時間：{duration}小時後
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" /> 活動地點
                        </h3>
                        <LocationPicker
                            value={location}
                            onChange={setLocation}
                        />
                    </div>

                    {/* Settings */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Info className="w-4 h-4 text-gray-400" /> 設定
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">公開活動</Label>
                                <p className="text-xs text-gray-500">所有人都可見</p>
                            </div>
                            <Switch
                                checked={watch("isPublic")}
                                onCheckedChange={(val) => setValue("isPublic", val)}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
}
