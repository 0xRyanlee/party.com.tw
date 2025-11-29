"use client";

import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function HostEdit() {
    const { t } = useLanguage();

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('host.edit.title')}</h1>
                <Button className="bg-black text-white rounded-full">Save Changes</Button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-lg font-bold">{t('host.edit.basicInfo')}</h2>

                <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input placeholder="e.g. Summer Pool Party" defaultValue="Friday Night Vibe" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label>Time</Label>
                        <Input type="time" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea className="h-32" placeholder="Describe your event..." />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-lg font-bold">{t('host.edit.tickets')}</h2>
                <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 text-sm border border-dashed border-gray-200">
                    Ticket management UI placeholder
                </div>
            </div>
        </div>
    );
}
