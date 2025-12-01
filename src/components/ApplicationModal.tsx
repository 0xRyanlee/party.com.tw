'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AsyncButton from '@/components/ui/AsyncButton';
import { EventRole, EventResource } from '@/types/schema';

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        id: string;
        title: string;
    };
    target: {
        type: 'role' | 'resource';
        id: string;
        data: EventRole | EventResource;
    };
}

export default function ApplicationModal({
    isOpen,
    onClose,
    event,
    target,
}: ApplicationModalProps) {
    const [message, setMessage] = useState('');
    const [contactInfo, setContactInfo] = useState('');

    const handleSubmit = async () => {
        try {
            // 驗證輸入
            if (!contactInfo.trim()) {
                alert('請填寫聯絡方式');
                return;
            }

            // 準備請求數據
            const requestData = {
                eventId: event.id,
                targetRoleId: target.type === 'role' ? target.id : null,
                targetResourceId: target.type === 'resource' ? target.id : null,
                message: message.trim(),
                contactInfo: contactInfo.trim(),
            };

            // 發送 API 請求
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit application');
            }

            // 成功提示
            alert('申請已提交！主辦方將會審核您的申請。');

            // 重置表單
            setMessage('');
            setContactInfo('');
            onClose();
        } catch (error: any) {
            console.error('Error submitting application:', error);
            alert(error.message || '提交申請失敗，請稍後再試');
        }
    };

    const isRole = target.type === 'role';
    const roleData = isRole ? (target.data as EventRole) : null;
    const resourceData = !isRole ? (target.data as EventResource) : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-1">申請參與</h2>
                                    <p className="text-gray-600">{event.title}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                                {/* Target Info */}
                                <div className="bg-gray-50 rounded-[24px] p-5">
                                    <h3 className="font-semibold mb-3">
                                        {isRole ? '🎯 申請角色' : '🤝 提供資源'}
                                    </h3>
                                    {isRole ? (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">角色：</span>
                                                <span className="font-medium">
                                                    {roleData?.roleType}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">需求人數：</span>
                                                <span className="font-medium">
                                                    {roleData?.countNeeded}
                                                </span>
                                            </div>
                                            {roleData?.budgetMin && roleData?.budgetMax && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">預算：</span>
                                                    <span className="font-medium">
                                                        ${roleData.budgetMin} - ${roleData.budgetMax}
                                                    </span>
                                                </div>
                                            )}
                                            {roleData?.description && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <p className="text-gray-700">
                                                        {roleData.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">資源類型：</span>
                                                <span className="font-medium">
                                                    {resourceData?.resourceType}
                                                </span>
                                            </div>
                                            {resourceData?.description && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <p className="text-gray-700">
                                                        {resourceData.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Application Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            聯絡方式 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={contactInfo}
                                            onChange={(e) => setContactInfo(e.target.value)}
                                            placeholder="Email、電話或其他聯絡方式"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            申請訊息
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder={
                                                isRole
                                                    ? '簡單介紹您的經驗和專長，讓主辦方更了解您...'
                                                    : '說明您能提供的資源或合作方式...'
                                            }
                                            rows={5}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-[20px] p-4">
                                    <p className="text-sm text-blue-800">
                                        💡 提交後，主辦方將會審核您的申請。您可以在「我的申請」中查看狀態。
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-full border-gray-300"
                                >
                                    取消
                                </Button>
                                <AsyncButton
                                    onClick={handleSubmit}
                                    disabled={!contactInfo.trim()}
                                    className="flex-1 h-12 bg-black hover:bg-gray-800 text-white"
                                    loadingText="提交中..."
                                    successText="已提交！"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    提交申請
                                </AsyncButton>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
