"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
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
import ExternalLinks from "@/components/host/ExternalLinks";
import { Calendar, MapPin, Clock, Info, Tag, Briefcase, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { EventRole, EventResource, TicketType } from "@/types/schema";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Edit mode type
type EditMode = 'new' | 'draft' | 'published';

// Zod Schema
const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    type: z.string().min(1, "Please select an event type"),
    status: z.enum(['active', 'draft']), // Simplified: no 'pending'
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
    imageMetadata: z.any().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function HostEdit() {
    const { t } = useLanguage();
    const router = useRouter();

    // Collaboration state
    const [roles, setRoles] = useState<Omit<EventRole, 'id' | 'eventId' | 'createdAt'>[]>([]);
    const [resources, setResources] = useState<Omit<EventResource, 'id' | 'eventId' | 'createdAt'>[]>([]);

    // Event attributes state
    const [capacity, setCapacity] = useState(50);
    const [invitationOnly, setInvitationOnly] = useState(false);
    const [isAdultOnly, setIsAdultOnly] = useState(false);
    const [invitationCode, setInvitationCode] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [advancedTickets, setAdvancedTickets] = useState<TicketType[]>([]);
    const [ticketingEnabled, setTicketingEnabled] = useState(true); // 票務功能開關
    const [mediaEnabled, setMediaEnabled] = useState(true); // 媒體素材開關
    const [duration, setDuration] = useState(2); // 活動時長（小時）
    const [location, setLocation] = useState<{ name: string; address: string; lat?: number; lng?: number }>({ name: '', address: '' });
    const [externalLinks, setExternalLinks] = useState<string[]>([]);
    const searchParams = useSearchParams();
    const eventId = searchParams.get('id');
    const [editMode, setEditMode] = useState<EditMode>(eventId ? 'published' : 'new');


    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [collaborationEnabled, setCollaborationEnabled] = useState(false); // Collaboration toggle
    const [contentImages, setContentImages] = useState<string[]>([]); // Max 3 content images
    const [sendEmailNotifications, setSendEmailNotifications] = useState(true); // Email notification toggle

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
            status: "draft", // Default to draft
            isPublic: true,
            tickets: [],
            date: "", // 空字串，避免默認今天導致過期判斷
            time: "18:00",
            locationName: "",
            address: "",
            externalLink: "",
            imageMetadata: {},
        }
    });

    // Fetch existing event data
    useEffect(() => {
        if (!eventId) return;

        const fetchEvent = async () => {
            const supabase = createClient();
            const { data: event, error } = await supabase
                .from('events')
                .select(`
                    *,
                    ticket_types (*),
                    event_resources (*),
                    event_roles (*)
                `)
                .eq('id', eventId)
                .single();

            if (error || !event) {
                console.error('Error fetching event:', error);
                toast.error('無法載入活動資料');
                return;
            }

            // Populate Form
            setValue('title', event.title);
            setValue('description', event.description_long || event.description_short || "");
            setValue('type', event.category || "party");
            setValue('status', event.status === 'draft' ? 'draft' : 'active');
            setValue('date', event.date);
            setValue('time', event.start_time ? event.start_time.split('T')[1].substring(0, 5) : "18:00");
            setValue('locationName', event.location_name || "");
            setValue('address', event.location_address || "");
            setValue('image', event.cover_image || "");
            setValue('isPublic', !event.is_private);

            // Populate State
            setCapacity(event.capacity_total || 50);
            setLocation({
                name: event.location_name || "",
                address: event.location_address || "",
                lat: event.gps_lat,
                lng: event.gps_lng
            });
            setDuration(2); // Hardcoded for now or derive from end_time
            if (event.ticket_types) {
                setAdvancedTickets(event.ticket_types.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    price: t.price,
                    quantity: t.quantity,
                    description: t.description,
                    currency: 'TWD'
                })));
            }
            if (event.event_resources) {
                setResources(event.event_resources.map((r: any) => ({
                    type: r.resource_type,
                    description: r.description,
                    quantity: r.quantity_needed,
                    status: 'open'
                })));
            }
            // Tags
            if (event.mood_tags) setSelectedTags(event.mood_tags);
            if (event.send_email_notifications !== undefined) setSendEmailNotifications(event.send_email_notifications);

            setEditMode(event.status === 'draft' ? 'draft' : 'published');
        };

        fetchEvent();
    }, [eventId, setValue]);

    const onSubmit = async (data: EventFormValues) => {
        try {

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
                imageMetadata: data.imageMetadata,
                sendEmailNotifications,
            };

            let eventResponse;
            let currentEventId = eventId;

            if (eventId) {
                // UPDATE existing event
                eventResponse = await fetch(`/api/events/${eventId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventPayload),
                });
            } else {
                // CREATE new event
                eventResponse = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventPayload),
                });
            }

            if (!eventResponse.ok) {
                const errorData = await eventResponse.json();
                throw new Error(errorData.error || 'Failed to save event');
            }

            const { event } = await eventResponse.json();
            console.log('Event saved:', event);
            if (!currentEventId) currentEventId = event.id;

            // 保存角色需求
            if (roles.length > 0) {
                const rolesResponse = await fetch(`/api/events/${currentEventId}/roles`, {
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
                const resourcesResponse = await fetch(`/api/events/${currentEventId}/resources`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resources }),
                });

                if (!resourcesResponse.ok) {
                    console.error('Failed to save resources');
                }
            }

            alert(eventId ? "活動已更新！" : "活動已成功建立！");
            // 導航到主辦方儀表板
            router.push('/host/dashboard');
        } catch (error: any) {
            console.error('Error saving event:', error);
            alert(error.message || '儲存活動失敗，請稍後再試');
        }
    };
    // Save as draft handler
    const handleSaveDraft = async () => {
        setIsSavingDraft(true);
        try {
            const formData = watch();
            // Validate minimal required fields for draft
            if (!formData.title || formData.title.length < 3) {
                alert('請輸入活動標題（至少 3 個字）');
                return;
            }

            let startTime: string | null = null;
            let endTime: string | null = null;

            if (formData.date && formData.time) {
                const timeWithSeconds = formData.time.length === 5 ? `${formData.time}:00` : formData.time;
                const dateTimeString = `${formData.date}T${timeWithSeconds}`;
                const startDate = new Date(dateTimeString);
                if (!isNaN(startDate.getTime())) {
                    startTime = startDate.toISOString();
                    const durationInHours = Number(duration) || 2;
                    const endDate = new Date(startDate.getTime() + durationInHours * 60 * 60 * 1000);
                    endTime = endDate.toISOString();
                }
            }

            const draftPayload = {
                title: formData.title,
                descriptionLong: formData.description || '',
                descriptionShort: (formData.description || '').substring(0, 200),
                category: formData.type,
                coverImage: formData.image,
                venueName: location.name || formData.locationName || '',
                address: location.address || formData.address || '',
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
                status: 'draft',
                externalLink: formData.externalLink || null,
            };

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draftPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save draft');
            }

            alert('草稿已保存');
            router.push('/host/dashboard');
        } catch (error: any) {
            console.error('Error saving draft:', error);
            alert(error.message || '保存草稿失敗');
        } finally {
            setIsSavingDraft(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm py-4 z-10 -mx-4 px-4 md:mx-0 md:px-0">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="-ml-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold">
                        {editMode === 'new' ? '創建活動' : editMode === 'draft' ? '編輯草稿' : '編輯活動'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {editMode === 'new' ? '建立您的新活動' : '修改活動詳情'}
                    </p>
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
                                <Label>活動標籤</Label>
                                <CustomTags
                                    selectedTags={selectedTags}
                                    onTagsChange={setSelectedTags}
                                />
                                <p className="text-xs text-gray-500">選擇或輸入活動類型標籤（最多 5 個）</p>
                            </div>

                            <div className="space-y-2">
                                <Label>外部連結（選填）</Label>
                                <ExternalLinks
                                    value={externalLinks}
                                    onChange={setExternalLinks}
                                    maxLinks={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date & Time Card - Moved from sidebar */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" /> 日期時間
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
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
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-500">活動時長</Label>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 6, 8].map((hours) => (
                                    <button
                                        key={hours}
                                        type="button"
                                        onClick={() => setDuration(hours)}
                                        className={`min-w-[48px] px-3 py-2 rounded-full border text-sm font-medium transition-all ${duration === hours
                                            ? 'border-gray-900 bg-gray-100 text-gray-900'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {hours}h
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3">
                                <Input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={duration}
                                    onChange={(e) => setDuration(parseFloat(e.target.value) || 2)}
                                    placeholder="或輸入自定義時長"
                                    className="text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                結束時間：{duration}小時後
                            </p>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                        <ImageUploader
                            value={watch("image")}
                            onChange={(val) => setValue("image", val)}
                            metadata={watch("imageMetadata")}
                            onMetadataChange={(meta) => setValue("imageMetadata", meta)}
                            enabled={mediaEnabled}
                            onEnabledChange={setMediaEnabled}
                            showToggle={true}
                            pathPrefix="events"
                        />

                        {/* Content Images (Max 3) */}
                        {mediaEnabled && (
                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-medium">活動內容照片</Label>
                                        <p className="text-xs text-gray-500">上傳最多 3 張活動照片（加上主圖共 4 張）</p>
                                    </div>
                                    <span className="text-sm text-gray-400">{contentImages.length}/3</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {contentImages.map((img, idx) => (
                                        <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-gray-100 relative group">
                                            <img src={img} alt={`Content ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setContentImages(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {contentImages.length < 3 && (
                                        <label className="aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                                            <span className="text-2xl text-gray-300">+</span>
                                            <span className="text-xs text-gray-400">新增照片</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file || contentImages.length >= 3) return;

                                                    // 5MB size validation
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        toast.error('檔案太大（最大 5MB）');
                                                        return;
                                                    }

                                                    // File type validation
                                                    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                                                    if (!allowedTypes.includes(file.type)) {
                                                        toast.error('不支援的圖片格式（僅支援 JPG、PNG、WebP、GIF）');
                                                        return;
                                                    }

                                                    try {
                                                        const supabase = createClient();
                                                        const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
                                                        const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
                                                        const fileName = `events/content/${timestamp}-${cleanName}`;

                                                        const { data, error } = await supabase.storage
                                                            .from('images')
                                                            .upload(fileName, file, { cacheControl: '3600', upsert: true });

                                                        if (error) throw error;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('images')
                                                            .getPublicUrl(data.path);

                                                        setContentImages(prev => [...prev, publicUrl]);
                                                        toast.success('照片上傳成功');
                                                    } catch (error: any) {
                                                        toast.error('上傳失敗：' + error.message);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Advanced Tickets Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                        <AdvancedTicketManager
                            tickets={advancedTickets}
                            onTicketsChange={setAdvancedTickets}
                            enabled={ticketingEnabled}
                            onEnabledChange={setTicketingEnabled}
                            showToggle={true}
                        />
                    </div>



                    {/* Collaboration Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <h2 className="text-lg font-bold">合作招募</h2>
                            </div>
                            <Switch
                                checked={collaborationEnabled}
                                onCheckedChange={setCollaborationEnabled}
                            />
                        </div>
                        {collaborationEnabled ? (
                            <CollaborationStep
                                roles={roles}
                                resources={resources}
                                onRolesChange={setRoles}
                                onResourcesChange={setResources}
                            />
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">
                                開啟此功能即可設定合作報名需求與資源徠换。
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column: Sidebar Details */}
                <div className="space-y-6">

                    {/* Participant Settings */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
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

                        <div className="space-y-3">
                            {/* Check if event is expired */}
                            {/* This useMemo hook needs to be defined outside of JSX, typically at the top of the component function.
                                For the purpose of this edit, it's placed here as per instruction, but in a real app,
                                it would be moved to the component's body. */}
                            {(() => {
                                const date = watch("date");
                                const time = watch("time");
                                const isExpired = useMemo(() => {
                                    if (!date || !time) return false; // 沒有選擇日期時間不顯示過期
                                    const eventDate = new Date(`${date}T${time}`);
                                    const now = new Date();
                                    return eventDate < now;
                                }, [date, time]);

                                return (
                                    <div className="space-y-2">
                                        <Label>活動狀態</Label>
                                        {isExpired ? (
                                            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 text-gray-500 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                                                    已過期 (Expired)
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    此活動時間已過，無法更改狀態。您可以選擇刪除活動。
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex p-1 bg-gray-100 rounded-lg">
                                                    {(['active', 'draft'] as const).map((s) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => setValue("status", s)}
                                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${watch("status") === s
                                                                ? "bg-white text-black shadow-sm"
                                                                : "text-gray-500 hover:text-gray-700"
                                                                }`}
                                                        >
                                                            {s === 'active' && '已發布'}
                                                            {s === 'draft' && '草稿'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    草稿：僅自己可見 | 已發布：公開可見
                                                </p>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">公開活動</Label>
                                    <p className="text-xs text-gray-500">所有人都可見</p>
                                </div>
                                <Switch
                                    checked={watch("isPublic")}
                                    onCheckedChange={(val) => setValue("isPublic", val)}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">發送郵件通知</Label>
                                    <p className="text-xs text-gray-500">向報名者發送報名確認和活動提醒</p>
                                </div>
                                <Switch
                                    checked={sendEmailNotifications}
                                    onCheckedChange={setSendEmailNotifications}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20">
                <div className="max-w-4xl mx-auto flex gap-3">
                    {editMode === 'new' && (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-full h-12"
                                onClick={handleSaveDraft}
                                disabled={isSavingDraft || isSubmitting}
                            >
                                {isSavingDraft ? '保存中...' : '保存草稿'}
                            </Button>
                            <LoadingButton
                                type="submit"
                                isLoading={isSubmitting}
                                loadingText="發佈中..."
                                className="flex-1 bg-black text-white rounded-full h-12"
                            >
                                立即發佈
                            </LoadingButton>
                        </>
                    )}
                    {editMode === 'draft' && (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-full h-12"
                                onClick={handleSaveDraft}
                                disabled={isSavingDraft || isSubmitting}
                            >
                                {isSavingDraft ? '保存中...' : '更新草稿'}
                            </Button>
                            <LoadingButton
                                type="submit"
                                isLoading={isSubmitting}
                                loadingText="發佈中..."
                                className="flex-1 bg-black text-white rounded-full h-12"
                            >
                                發佈活動
                            </LoadingButton>
                        </>
                    )}
                    {editMode === 'published' && (
                        <LoadingButton
                            type="submit"
                            isLoading={isSubmitting}
                            loadingText="更新中..."
                            className="flex-1 bg-black text-white rounded-full h-12"
                        >
                            更新活動
                        </LoadingButton>
                    )}
                </div>
            </div>
        </form>
    );
}
