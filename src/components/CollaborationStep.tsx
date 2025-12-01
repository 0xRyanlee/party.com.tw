'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, DollarSign } from 'lucide-react';
import { EventRole, EventResource } from '@/types/schema';

interface CollaborationStepProps {
    roles: Omit<EventRole, 'id' | 'eventId' | 'createdAt'>[];
    resources: Omit<EventResource, 'id' | 'eventId' | 'createdAt'>[];
    onRolesChange: (roles: Omit<EventRole, 'id' | 'eventId' | 'createdAt'>[]) => void;
    onResourcesChange: (resources: Omit<EventResource, 'id' | 'eventId' | 'createdAt'>[]) => void;
}

const roleTypes = [
    { value: 'photographer', label: '攝影師 Photographer' },
    { value: 'dj', label: 'DJ' },
    { value: 'bartender', label: '調酒師 Bartender' },
    { value: 'staff', label: '工作人員 Staff' },
    { value: 'performer', label: '表演者 Performer' },
    { value: 'mc', label: '主持人 MC' },
    { value: 'security', label: '安全人員 Security' },
    { value: 'other', label: '其他 Other' },
];

const resourceTypes = [
    { value: 'venue', label: '場地 Venue' },
    { value: 'sponsor', label: '贊助 Sponsor' },
    { value: 'equipment', label: '設備租賃 Equipment' },
    { value: 'catering', label: '餐飲 Catering' },
    { value: 'partner', label: '協辦單位 Partner' },
    { value: 'other', label: '其他 Other' },
];

export default function CollaborationStep({
    roles,
    resources,
    onRolesChange,
    onResourcesChange,
}: CollaborationStepProps) {
    const addRole = () => {
        onRolesChange([
            ...roles,
            {
                roleType: 'photographer',
                countNeeded: 1,
                budgetMin: undefined,
                budgetMax: undefined,
                description: '',
                status: 'open',
            },
        ]);
    };

    const addResource = () => {
        onResourcesChange([
            ...resources,
            {
                resourceType: 'venue',
                description: '',
                status: 'open',
            },
        ]);
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
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold mb-2">合作招募 Collaboration</h2>
                <p className="text-gray-600">
                    開放專業工作者和資源提供者申請參與您的活動
                </p>
            </div>

            {/* Vendor Roles Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">專業工作者 Vendors</h3>
                        <p className="text-sm text-gray-500">需要的人員和角色</p>
                    </div>
                    <Button
                        type="button"
                        onClick={addRole}
                        className="bg-black hover:bg-gray-800 text-white rounded-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        新增角色
                    </Button>
                </div>

                <div className="space-y-4">
                    {roles.map((role, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-[24px] p-6 border border-gray-200 space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Role Type */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            角色類型
                                        </label>
                                        <select
                                            value={role.roleType}
                                            onChange={(e) =>
                                                updateRole(index, 'roleType', e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            {roleTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Count Needed */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            需求人數
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={role.countNeeded}
                                            onChange={(e) =>
                                                updateRole(
                                                    index,
                                                    'countNeeded',
                                                    parseInt(e.target.value) || 1
                                                )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>

                                    {/* Budget Range */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            預算範圍 (可選)
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center flex-1 border border-gray-300 rounded-xl px-4 py-2">
                                                <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                                                <input
                                                    type="number"
                                                    placeholder="最低"
                                                    value={role.budgetMin || ''}
                                                    onChange={(e) =>
                                                        updateRole(
                                                            index,
                                                            'budgetMin',
                                                            e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : undefined
                                                        )
                                                    }
                                                    className="flex-1 outline-none"
                                                />
                                            </div>
                                            <span className="text-gray-400">-</span>
                                            <div className="flex items-center flex-1 border border-gray-300 rounded-xl px-4 py-2">
                                                <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                                                <input
                                                    type="number"
                                                    placeholder="最高"
                                                    value={role.budgetMax || ''}
                                                    onChange={(e) =>
                                                        updateRole(
                                                            index,
                                                            'budgetMax',
                                                            e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : undefined
                                                        )
                                                    }
                                                    className="flex-1 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            工作描述
                                        </label>
                                        <textarea
                                            value={role.description}
                                            onChange={(e) =>
                                                updateRole(index, 'description', e.target.value)
                                            }
                                            placeholder="例如：需要經驗豐富的攝影師，拍攝活動精彩瞬間..."
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRole(index)}
                                    className="ml-2 text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {roles.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            尚未新增任何角色需求
                        </div>
                    )}
                </div>
            </div>

            {/* Supplier Resources Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">資源提供者 Suppliers</h3>
                        <p className="text-sm text-gray-500">需要的場地、贊助或協辦</p>
                    </div>
                    <Button
                        type="button"
                        onClick={addResource}
                        className="bg-black hover:bg-gray-800 text-white rounded-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        新增需求
                    </Button>
                </div>

                <div className="space-y-4">
                    {resources.map((resource, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-[24px] p-6 border border-gray-200 space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-4">
                                    {/* Resource Type */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            資源類型
                                        </label>
                                        <select
                                            value={resource.resourceType}
                                            onChange={(e) =>
                                                updateResource(index, 'resourceType', e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            {resourceTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            需求描述
                                        </label>
                                        <textarea
                                            value={resource.description}
                                            onChange={(e) =>
                                                updateResource(index, 'description', e.target.value)
                                            }
                                            placeholder="例如：尋找能容納100人的活動場地，需有音響設備..."
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeResource(index)}
                                    className="ml-2 text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {resources.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            尚未新增任何資源需求
                        </div>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-[24px] p-6">
                <h4 className="font-semibold text-blue-900 mb-2">💡 提示</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 申請者將在活動詳情頁看到這些合作機會</li>
                    <li>• 您可以在活動管理頁面查看和審核所有申請</li>
                    <li>• 預算範圍為可選項目，但建議填寫以吸引更多申請</li>
                </ul>
            </div>
        </div>
    );
}
