'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ShieldAlert, Plus, Trash2, RefreshCw, AlertCircle,
    Search, Filter, Edit2, Save, X
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SensitiveWord {
    id: string;
    word: string;
    category: 'political' | 'adult' | 'gambling' | 'fraud' | 'violence' | 'other';
    match_type: 'exact' | 'fuzzy';
    trigger_count: number;
    created_at: string;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
    political: { label: '政治', color: 'bg-red-100 text-red-600 border-red-200' },
    adult: { label: '成人', color: 'bg-pink-100 text-pink-600 border-pink-200' },
    gambling: { label: '賭博', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    fraud: { label: '詐騙', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    violence: { label: '暴力', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    other: { label: '其他', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

// 預設敏感詞（實際應從 Supabase 獲取）
const defaultWords: SensitiveWord[] = [
    { id: '1', word: '博彩', category: 'gambling', match_type: 'fuzzy', trigger_count: 0, created_at: new Date().toISOString() },
    { id: '2', word: '賭場', category: 'gambling', match_type: 'exact', trigger_count: 2, created_at: new Date().toISOString() },
    { id: '3', word: '詐騙', category: 'fraud', match_type: 'fuzzy', trigger_count: 5, created_at: new Date().toISOString() },
    { id: '4', word: '投資理財', category: 'fraud', match_type: 'exact', trigger_count: 3, created_at: new Date().toISOString() },
];

export default function SensitiveWordsPage() {
    const [words, setWords] = useState<SensitiveWord[]>(defaultWords);
    const [filteredWords, setFilteredWords] = useState<SensitiveWord[]>(defaultWords);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWord, setEditingWord] = useState<SensitiveWord | null>(null);

    // Form state
    const [formWord, setFormWord] = useState('');
    const [formCategory, setFormCategory] = useState<SensitiveWord['category']>('other');
    const [formMatchType, setFormMatchType] = useState<SensitiveWord['match_type']>('fuzzy');

    // Filter logic
    useEffect(() => {
        let result = words;

        if (searchQuery) {
            result = result.filter(w =>
                w.word.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            result = result.filter(w => w.category === categoryFilter);
        }

        setFilteredWords(result);
    }, [words, searchQuery, categoryFilter]);

    const resetForm = () => {
        setFormWord('');
        setFormCategory('other');
        setFormMatchType('fuzzy');
        setEditingWord(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEditDialog = (word: SensitiveWord) => {
        setEditingWord(word);
        setFormWord(word.word);
        setFormCategory(word.category);
        setFormMatchType(word.match_type);
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (!formWord.trim()) {
            toast.error('請輸入敏感詞');
            return;
        }

        if (editingWord) {
            // 編輯
            setWords(prev => prev.map(w =>
                w.id === editingWord.id
                    ? { ...w, word: formWord, category: formCategory, match_type: formMatchType }
                    : w
            ));
            toast.success('敏感詞已更新');
        } else {
            // 新增
            const newWord: SensitiveWord = {
                id: Date.now().toString(),
                word: formWord.trim(),
                category: formCategory,
                match_type: formMatchType,
                trigger_count: 0,
                created_at: new Date().toISOString(),
            };
            setWords(prev => [newWord, ...prev]);
            toast.success('敏感詞已添加');
        }

        setDialogOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        setWords(prev => prev.filter(w => w.id !== id));
        toast.success('敏感詞已刪除');
    };

    const handleBatchAdd = () => {
        const input = prompt('請輸入敏感詞（每行一個）：');
        if (!input) return;

        const newWords = input.split('\n')
            .map(w => w.trim())
            .filter(w => w && !words.some(existing => existing.word === w))
            .map(w => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                word: w,
                category: 'other' as const,
                match_type: 'fuzzy' as const,
                trigger_count: 0,
                created_at: new Date().toISOString(),
            }));

        if (newWords.length > 0) {
            setWords(prev => [...newWords, ...prev]);
            toast.success(`已添加 ${newWords.length} 個敏感詞`);
        } else {
            toast.info('沒有新的敏感詞可添加');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6" />
                        敏感詞管理
                    </h2>
                    <p className="text-gray-500">管理平台內容過濾詞庫</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsLoading(true)} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBatchAdd}>
                        批量添加
                    </Button>
                    <Button size="sm" onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        新增詞彙
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-6">
                {Object.entries(categoryLabels).map(([key, { label }]) => (
                    <Card key={key}>
                        <CardContent className="pt-4 pb-4 text-center">
                            <p className="text-2xl font-bold">{words.filter(w => w.category === key).length}</p>
                            <p className="text-xs text-gray-500">{label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="搜尋敏感詞..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部類別</SelectItem>
                        {Object.entries(categoryLabels).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Words List */}
            <Card>
                <CardHeader>
                    <CardTitle>詞庫列表</CardTitle>
                    <CardDescription>共 {filteredWords.length} 個敏感詞</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredWords.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>暫無敏感詞</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {filteredWords.map((word) => (
                                <div
                                    key={word.id}
                                    className="group flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors"
                                >
                                    <span className="font-medium">{word.word}</span>
                                    <Badge variant="outline" className={categoryLabels[word.category].color}>
                                        {categoryLabels[word.category].label}
                                    </Badge>
                                    {word.match_type === 'exact' && (
                                        <Badge variant="outline" className="text-xs">精確</Badge>
                                    )}
                                    {word.trigger_count > 0 && (
                                        <span className="text-xs text-gray-400">觸發 {word.trigger_count}</span>
                                    )}
                                    <div className="hidden group-hover:flex items-center gap-1 ml-2">
                                        <button onClick={() => openEditDialog(word)} className="p-1 hover:bg-gray-200 rounded">
                                            <Edit2 className="w-3 h-3 text-gray-500" />
                                        </button>
                                        <button onClick={() => handleDelete(word.id)} className="p-1 hover:bg-red-100 rounded">
                                            <Trash2 className="w-3 h-3 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingWord ? '編輯敏感詞' : '新增敏感詞'}</DialogTitle>
                        <DialogDescription>設定詞彙類別和匹配方式</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">詞彙</label>
                            <Input
                                value={formWord}
                                onChange={(e) => setFormWord(e.target.value)}
                                placeholder="請輸入敏感詞"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">類別</label>
                            <Select value={formCategory} onValueChange={(v) => setFormCategory(v as SensitiveWord['category'])}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categoryLabels).map(([key, { label }]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">匹配方式</label>
                            <div className="flex gap-2 mt-1">
                                {[
                                    { value: 'fuzzy', label: '模糊匹配' },
                                    { value: 'exact', label: '精確匹配' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFormMatchType(opt.value as SensitiveWord['match_type'])}
                                        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${formMatchType === opt.value
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
