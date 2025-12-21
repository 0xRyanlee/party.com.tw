'use client';

import { useState } from 'react';
import { X, Search, ArrowRight, AlertTriangle, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface TransferOwnershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'event' | 'club';
    itemId: string;
    itemName: string;
    onSuccess?: () => void;
}

interface SearchResult {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
}

export default function TransferOwnershipModal({
    isOpen,
    onClose,
    type,
    itemId,
    itemName,
    onSuccess,
}: TransferOwnershipModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [step, setStep] = useState<'search' | 'confirm'>('search');

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        const supabase = createClient();

        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
            .limit(5);

        if (error) {
            toast.error('搜尋失敗');
        } else {
            setSearchResults(data || []);
        }
        setIsSearching(false);
    };

    const handleSelectUser = (user: SearchResult) => {
        setSelectedUser(user);
        setStep('confirm');
    };

    const handleTransfer = async () => {
        if (!selectedUser) return;

        setIsTransferring(true);

        const endpoint = type === 'event'
            ? `/api/events/${itemId}/transfer`
            : `/api/clubs/${itemId}/transfer`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newOwnerId: selectedUser.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || '轉讓失敗');
                if (data.reason === 'membership_required') {
                    toast.error('對方需要升級為 Plus 會員才能接手俱樂部');
                }
            } else {
                toast.success(data.message || '轉讓成功');
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            toast.error('網路錯誤，請稍後再試');
        } finally {
            setIsTransferring(false);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedUser(null);
        setStep('search');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div
                className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {type === 'club' ? <Crown className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                            轉讓{type === 'event' ? '活動' : '俱樂部'}
                        </h2>
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        將「{itemName}」轉讓給其他用戶
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'search' ? (
                        <>
                            {/* Search Input */}
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="搜尋用戶名稱或 Email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10 rounded-full"
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="rounded-full"
                                >
                                    搜尋
                                </Button>
                            </div>

                            {/* Search Results */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {searchResults.length === 0 && searchQuery && !isSearching && (
                                    <p className="text-sm text-gray-500 text-center py-4">找不到符合的用戶</p>
                                )}
                                {searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleSelectUser(user)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                    {(user.full_name || 'U')[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {user.full_name || '未設定名稱'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Confirmation */}
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">確認轉讓</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    您即將把「{itemName}」轉讓給
                                </p>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                        {selectedUser?.avatar_url ? (
                                            <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                                {(selectedUser?.full_name || 'U')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">
                                            {selectedUser?.full_name || '未設定名稱'}
                                        </p>
                                        <p className="text-xs text-gray-500">{selectedUser?.email}</p>
                                    </div>
                                </div>

                                <p className="text-xs text-red-500 mb-4">
                                    ⚠️ 此操作無法撤銷，轉讓後您將失去{type === 'event' ? '活動' : '俱樂部'}管理權限
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-full"
                                    onClick={() => setStep('search')}
                                >
                                    返回
                                </Button>
                                <Button
                                    className="flex-1 rounded-full bg-red-600 hover:bg-red-700"
                                    onClick={handleTransfer}
                                    disabled={isTransferring}
                                >
                                    {isTransferring ? '轉讓中...' : '確認轉讓'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
