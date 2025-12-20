"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Ticket } from "lucide-react";
import { useFieldArray, Control, UseFormRegister } from "react-hook-form";

interface TicketManagerProps {
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: any;
}

export default function TicketManager({ control, register, errors }: TicketManagerProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "tickets",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <Ticket className="w-4 h-4" /> 票種設定
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", price: 0, quantity: 100 })}
                    className="rounded-full text-xs"
                >
                    <Plus className="w-3 h-3 mr-1" /> 新增票種
                </Button>
            </div>

            {fields.length === 0 && (
                <div className="text-center p-6 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                    <p className="text-sm text-gray-400">尚未建立票種</p>
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => append({ name: "一般入場", price: 0, quantity: 100 })}
                        className="text-gray-900 font-medium"
                    >
                        新增第一個票種
                    </Button>
                </div>
            )}

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                        <div className="flex-1 space-y-1">
                            <Label className="text-xs text-gray-500">票種名稱</Label>
                            <Input
                                {...register(`tickets.${index}.name` as const, { required: "請輸入名稱" })}
                                placeholder="例如：早鳥票"
                                className="bg-white h-9"
                            />
                            {errors.tickets?.[index]?.name && (
                                <p className="text-xs text-red-500">{errors.tickets[index].name.message}</p>
                            )}
                        </div>
                        <div className="w-24 space-y-1">
                            <Label className="text-xs text-gray-500">價格 (TWD)</Label>
                            <Input
                                type="number"
                                {...register(`tickets.${index}.price` as const, { valueAsNumber: true, min: 0 })}
                                placeholder="0"
                                className="bg-white h-9"
                            />
                        </div>
                        <div className="w-24 space-y-1">
                            <Label className="text-xs text-gray-500">數量</Label>
                            <Input
                                type="number"
                                {...register(`tickets.${index}.quantity` as const, { valueAsNumber: true, min: 1 })}
                                placeholder="100"
                                className="bg-white h-9"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="mt-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-9 w-9 shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
