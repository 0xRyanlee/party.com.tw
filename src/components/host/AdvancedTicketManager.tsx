'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ticket, Plus, X, DollarSign, Utensils } from 'lucide-react';

interface TicketTypeData {
    id: string;
    name: string;
    price: number;
    quantity: number;
    includeMeal: boolean;
}

interface AdvancedTicketManagerProps {
    tickets?: TicketTypeData[];
    currency?: string;
    onTicketsChange?: (tickets: TicketTypeData[]) => void;
}

export default function AdvancedTicketManager({
    tickets = [],
    currency = 'TWD',
    onTicketsChange,
}: AdvancedTicketManagerProps) {
    const [ticketList, setTicketList] = useState<TicketTypeData[]>(tickets);

    const addTicket = () => {
        const newTicket: TicketTypeData = {
            id: `ticket-${Date.now()}`,
            name: '',
            price: 0,
            quantity: 50,
            includeMeal: false,
        };
        const updated = [...ticketList, newTicket];
        setTicketList(updated);
        onTicketsChange?.(updated);
    };

    const removeTicket = (id: string) => {
        const updated = ticketList.filter((t) => t.id !== id);
        setTicketList(updated);
        onTicketsChange?.(updated);
    };

    const updateTicket = (id: string, field: keyof TicketTypeData, value: any) => {
        const updated = ticketList.map((t) =>
            t.id === id ? { ...t, [field]: value } : t
        );
        setTicketList(updated);
        onTicketsChange?.(updated);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">票務設定</h3>
                        <p className="text-sm text-gray-500">設定票種、價格和庫存</p>
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={addTicket}
                    className="bg-black hover:bg-gray-800 text-white rounded-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    新增票種
                </Button>
            </div>

            {/* Ticket List */}
            <div className="space-y-4">
                {ticketList.map((ticket, index) => (
                    <div
                        key={ticket.id}
                        className="bg-white border border-gray-200 rounded-[20px] p-5 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-700">票種 #{index + 1}</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTicket(ticket.id)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Ticket Name */}
                            <div>
                                <Label className="text-sm">票種名稱</Label>
                                <Input
                                    value={ticket.name}
                                    onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
                                    placeholder="例如：早鳥票、一般票"
                                    className="mt-1"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <Label className="text-sm">價格 ({currency})</Label>
                                <div className="relative mt-1">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="number"
                                        value={ticket.price}
                                        onChange={(e) => updateTicket(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        className="pl-10"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Quantity */}
                            <div>
                                <Label className="text-sm">數量</Label>
                                <Input
                                    type="number"
                                    value={ticket.quantity}
                                    onChange={(e) => updateTicket(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                                    placeholder="50"
                                    className="mt-1"
                                    min="1"
                                />
                            </div>

                            {/* Include Meal */}
                            <div>
                                <Label className="text-sm">餐點</Label>
                                <button
                                    type="button"
                                    onClick={() => updateTicket(ticket.id, 'includeMeal', !ticket.includeMeal)}
                                    className={`w-full mt-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${ticket.includeMeal
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <Utensils className="w-4 h-4" />
                                    {ticket.includeMeal ? '包含餐點' : '不含餐'}
                                </button>
                            </div>
                        </div>

                        {/* Quick Presets for Free Ticket */}
                        {ticket.price === 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-800">
                                    💚 此為免費票券
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                {/* Empty State */}
                {ticketList.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-[20px]">
                        <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 mb-4">尚未新增票種</p>
                        <Button
                            type="button"
                            onClick={addTicket}
                            variant="outline"
                            className="rounded-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            新增第一個票種
                        </Button>
                    </div>
                )}
            </div>

            {/* Summary */}
            {ticketList.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 text-sm mb-2">🎫 票務總結</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 總票種數：{ticketList.length} 種</li>
                        <li>• 總票數：{ticketList.reduce((sum, t) => sum + t.quantity, 0)} 張</li>
                        <li>
                            • 價格範圍：${Math.min(...ticketList.map((t) => t.price))} - $
                            {Math.max(...ticketList.map((t) => t.price))}
                        </li>
                        <li>
                            • 含餐票種：{ticketList.filter((t) => t.includeMeal).length} 種
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
