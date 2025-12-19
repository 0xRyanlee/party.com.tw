'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    eventTitle: string;
    ticketTypes?: Array<{ name: string; price: number; quantity?: number }>;
}

export default function RegistrationModal({
    isOpen,
    onClose,
    eventId,
    eventTitle,
    ticketTypes = [],
}: RegistrationModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [checkinCode, setCheckinCode] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        attendee_name: '',
        attendee_email: '',
        attendee_phone: '',
        ticket_type_id: ticketTypes[0]?.name || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { registerWithDetails } = await import('@/app/actions/events');
            const result = await registerWithDetails(eventId, {
                attendee_name: formData.attendee_name,
                attendee_email: formData.attendee_email,
                attendee_phone: formData.attendee_phone || undefined,
                ticket_type_id: formData.ticket_type_id || undefined,
            });

            if (!result.success) {
                throw new Error(result.message);
            }

            setSuccess(true);
            setCheckinCode(result.checkin_code || null);

            // Let user see the code, don't auto-close too fast
            // Or remove auto-close to let them screenshot

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">報名參加</DialogTitle>
                    <DialogDescription>
                        {eventTitle}
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center space-y-6">
                        <div className="flex flex-col items-center">
                            <CheckCircle className="w-16 h-16 mb-4 text-green-600" />
                            <h3 className="text-2xl font-bold mb-1">報名成功！</h3>
                            <p className="text-neutral-500 text-sm">
                                確認郵件已發送到您的信箱
                            </p>
                        </div>

                        {checkinCode && (
                            <div className="bg-neutral-50 p-6 rounded-[32px] border border-neutral-100 space-y-3">
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">您的專屬簽到碼</p>
                                <div className="text-4xl font-black font-mono tracking-[0.3em] text-neutral-900 border-b-2 border-neutral-200 pb-2 inline-block">
                                    {checkinCode}
                                </div>
                                <p className="text-xs text-neutral-500">請妥善保存，於活動現場向主辦方出示</p>
                            </div>
                        )}

                        <Button
                            onClick={() => {
                                router.refresh();
                                onClose();
                                setSuccess(false);
                            }}
                            className="w-full rounded-full h-12 bg-neutral-900 font-bold"
                        >
                            完成
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="attendee_name">
                                姓名 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="attendee_name"
                                name="attendee_name"
                                type="text"
                                required
                                value={formData.attendee_name}
                                onChange={handleChange}
                                placeholder="請輸入您的姓名"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="attendee_email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="attendee_email"
                                name="attendee_email"
                                type="email"
                                required
                                value={formData.attendee_email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="attendee_phone">
                                電話（選填）
                            </Label>
                            <Input
                                id="attendee_phone"
                                name="attendee_phone"
                                type="tel"
                                value={formData.attendee_phone}
                                onChange={handleChange}
                                placeholder="0912-345-678"
                                className="rounded-xl"
                            />
                        </div>

                        {ticketTypes.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="ticket_type_id">
                                    票種 <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="ticket_type_id"
                                    name="ticket_type_id"
                                    required
                                    value={formData.ticket_type_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                                >
                                    {ticketTypes.map((ticket, idx) => (
                                        <option key={idx} value={ticket.name}>
                                            {ticket.name} - ${ticket.price}
                                            {ticket.quantity && ` (剩餘 ${ticket.quantity})`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="rounded-xl"
                            >
                                取消
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        報名中...
                                    </>
                                ) : (
                                    '確認報名'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
