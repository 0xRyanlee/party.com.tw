'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, DollarSign } from 'lucide-react';
import { EventRole, EventResource } from '@/types/schema';

interface CollaborationStepProps {
    roles: Omit<EventRole, 'id' | 'eventId' | 'createdAt'>[];
    resources: Omit<EventResource, 'id' | 'eventId' | 'createdAt'>[];
    onRolesChange: (roles: Omit<EventRole, 'id' | 'eventId' | 'createdAt'>[]) => void;
    onResourcesChange: (resources: Omit<EventResource, 'id' | 'eventId' | 'createdAt'>[]) => void;
}

// 常用角色類型建議
const suggestedRoles = ['攝影師', 'DJ', '調酒師', '工作人員', '表演者', '主持人', '安全人員'];
const suggestedResources = ['場地', '贊助', '設備租賃', '餐飲', '協辦單位'];

export default function CollaborationStep({
    roles,
    resources,
    onRolesChange,
    onResourcesChange,
}: CollaborationStepProps) {
    const [roleInput, setRoleInput] = useState('');
    const [resourceInput, setResourceInput] = useState('');

    const addRole = (roleType: string) => {
        if (!roleType.trim()) return;
        onRolesChange([
            ...roles,
            {
                roleType: roleType.trim(),
                countNeeded: 1,
                budgetMin: undefined,
                budgetMax: undefined,
                description: '',
                status: 'open',
            },
        ]);
        setRoleInput('');
    };

    const addResource = (resourceType: string) => {
        if (!resourceType.trim()) return;
        onResourcesChange([
            ...resources,
            {
                resourceType: resourceType.trim(),
                description: '',
                status: 'open',
            },
        ]);
        setResourceInput('');
    };

    const updateRole = (index: number, field: string, value: any) => {
        const updated = [...roles];
        updated[index] = { ...updated[index], [field]: value };
        onRolesChange(updated);
    };

    const updateResource = (index: number, field: string, value: any) => {
        const updated = [...resources];
        updated[index] = { ...updated[index], [field]: value };
        onResourcesChange(updated);
    };

    const removeRole = (index: number) => {
        onRolesChange(roles.filter((_, i) => i !== index));
    };

    const removeResource = (index: number) => {
        onResourcesChange(resources.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
            {/* Vendor Roles Section */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">專業工作者 Vendors</h3>
                    <p className="text-sm text-gray-500">需要的人員和角色</p>
                </div>

                {/* Role Tag Input */}
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            value={roleInput}
                            onChange={(e) => setRoleInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole(roleInput))}
                            placeholder="輸入角色類型，如：攝影師、DJ..."
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            onClick={() => addRole(roleInput)}
                            disabled={!roleInput.trim()}
                            className="bg-black text-white rounded-full"
                        >
                            <Plus className="w-4 h-4 mr-1" /> 新增
                        </Button>
                    </div>

                    {/* Suggested Tags */}
                    <div className="flex flex-wrap gap-2">
                        {suggestedRoles
                            .filter(r => !roles.some(role => role.roleType === r))
                            .map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => addRole(role)}
                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-full hover:border-gray-400 transition-colors"
                                >
                                    + {role}
                                </button>
                            ))}
                    </div>
                </div>

                {/* Added Roles */}
                <div className="space-y-3">
                    {roles.map((role, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium bg-black text-white px-3 py-1 rounded-full text-sm">
                                    {role.roleType}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRole(index)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">需求人數</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={role.countNeeded}
                                        onChange={(e) => updateRole(index, 'countNeeded', parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">預算（選填）</label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="number"
                                            placeholder="最低"
                                            value={role.budgetMin || ''}
                                            onChange={(e) => updateRole(index, 'budgetMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                        <span className="text-gray-400">-</span>
                                        <Input
                                            type="number"
                                            placeholder="最高"
                                            value={role.budgetMax || ''}
                                            onChange={(e) => updateRole(index, 'budgetMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">工作描述</label>
                                <textarea
                                    value={role.description}
                                    onChange={(e) => updateRole(index, 'description', e.target.value)}
                                    placeholder="描述這個角色的工作內容..."
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Supplier Resources Section */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">資源提供者 Suppliers</h3>
                    <p className="text-sm text-gray-500">需要的場地、贊助或協辦</p>
                </div>

                {/* Resource Tag Input */}
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            value={resourceInput}
                            onChange={(e) => setResourceInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResource(resourceInput))}
                            placeholder="輸入資源類型，如：場地、贊助..."
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            onClick={() => addResource(resourceInput)}
                            disabled={!resourceInput.trim()}
                            className="bg-black text-white rounded-full"
                        >
                            <Plus className="w-4 h-4 mr-1" /> 新增
                        </Button>
                    </div>

                    {/* Suggested Tags */}
                    <div className="flex flex-wrap gap-2">
                        {suggestedResources
                            .filter(r => !resources.some(res => res.resourceType === r))
                            .map((res) => (
                                <button
                                    key={res}
                                    type="button"
                                    onClick={() => addResource(res)}
                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-full hover:border-gray-400 transition-colors"
                                >
                                    + {res}
                                </button>
                            ))}
                    </div>
                </div>

                {/* Added Resources */}
                <div className="space-y-3">
                    {resources.map((resource, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium bg-black text-white px-3 py-1 rounded-full text-sm">
                                    {resource.resourceType}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeResource(index)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">需求描述</label>
                                <textarea
                                    value={resource.description}
                                    onChange={(e) => updateResource(index, 'description', e.target.value)}
                                    placeholder="描述這項資源的需求..."
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600">
                    提示：申請者將在活動詳情頁看到這些合作機會
                </p>
            </div>
        </div>
    );
}
