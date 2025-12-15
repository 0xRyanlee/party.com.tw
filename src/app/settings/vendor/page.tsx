'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Plus, X, Save, Briefcase, Mail, Phone, Globe, Instagram, Linkedin, ChevronLeft, ChevronRight, Image } from 'lucide-react';

export default function VendorProfilePage() {
    const { t } = useLanguage();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [profile, setProfile] = useState({
        displayName: '',
        bio: '',
        categories: [] as string[],
        coverImages: [] as string[], // 3-5 張輪播圖片
        portfolio: [] as { title: string; description: string; image?: string }[],
        contact: {
            email: '',
            phone: '',
            website: '',
        },
        socialLinks: {
            instagram: '',
            linkedin: '',
            threads: '',
        },
        services: [] as { name: string; description: string; price?: string }[], // 服務項目
        pricing: {
            min: '',
            max: '',
            currency: 'TWD',
        },
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleCategoryToggle = (category: string) => {
        setProfile((prev) => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter((c) => c !== category)
                : [...prev.categories, category],
        }));
    };

    const addPortfolioItem = () => {
        setProfile((prev) => ({
            ...prev,
            portfolio: [...prev.portfolio, { title: '', description: '' }],
        }));
    };

    const removePortfolioItem = (index: number) => {
        setProfile((prev) => ({
            ...prev,
            portfolio: prev.portfolio.filter((_, i) => i !== index),
        }));
    };

    const updatePortfolioItem = (index: number, field: string, value: string) => {
        setProfile((prev) => ({
            ...prev,
            portfolio: prev.portfolio.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: API call to save profile
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('Saving Vendor Profile:', profile);
        alert(t('vendor.profile.saved'));
        setIsSaving(false);
    };

    const serviceCategories = [
        { value: 'photographer', label: '攝影師 Photographer' },
        { value: 'dj', label: 'DJ' },
        { value: 'bartender', label: '調酒師 Bartender' },
        { value: 'mc', label: '主持人 MC' },
        { value: 'performer', label: '表演者 Performer' },
        { value: 'catering', label: '餐飲服務 Catering' },
        { value: 'venue', label: '場地提供 Venue' },
        { value: 'equipment', label: '設備租賃 Equipment' },
        { value: 'other', label: '其他 Other' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('vendor.profile.title')}</h1>
                        <p className="text-sm text-gray-500">{t('vendor.profile.subtitle')}</p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? t('vendor.profile.saving') : t('vendor.profile.saveButton')}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold">{t('vendor.profile.basicInfo')}</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>{t('vendor.profile.displayName')}</Label>
                                <Input
                                    value={profile.displayName}
                                    onChange={(e) =>
                                        setProfile({ ...profile, displayName: e.target.value })
                                    }
                                    placeholder={t('vendor.profile.displayNamePlaceholder')}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label>{t('vendor.profile.bio')}</Label>
                                <Textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder={t('vendor.profile.bioPlaceholder')}
                                    rows={4}
                                    className="mt-2 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {profile.bio.length} / 500 {t('vendor.profile.bioCount')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Service Categories */}
                    <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-6">
                        <h2 className="text-xl font-bold">服務類別</h2>
                        <p className="text-sm text-gray-600">選擇您提供的服務（可多選）</p>

                        <div className="flex flex-wrap gap-3">
                            {serviceCategories.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => handleCategoryToggle(cat.value)}
                                    className={`px-4 py-2 rounded-full border-2 transition-all ${profile.categories.includes(cat.value)
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Portfolio */}
                    <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">作品集</h2>
                            <Button
                                onClick={addPortfolioItem}
                                variant="outline"
                                className="rounded-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                新增作品
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {profile.portfolio.map((item, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-[20px] p-4 space-y-3"
                                >
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-semibold text-gray-700">
                                            作品 #{index + 1}
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePortfolioItem(index)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div>
                                        <Label className="text-sm">作品標題</Label>
                                        <Input
                                            value={item.title}
                                            onChange={(e) =>
                                                updatePortfolioItem(index, 'title', e.target.value)
                                            }
                                            placeholder="例如：2024 春季音樂祭攝影"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm">作品描述</Label>
                                        <Textarea
                                            value={item.description}
                                            onChange={(e) =>
                                                updatePortfolioItem(
                                                    index,
                                                    'description',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="描述這個作品的亮點、使用的技術或創意..."
                                            rows={3}
                                            className="mt-1 resize-none"
                                        />
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                                        <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-500">點擊上傳作品圖片</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            支援 JPG, PNG (最大 5MB)
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {profile.portfolio.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    尚未新增作品，點擊上方「新增作品」開始建立作品集
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-6">
                        <h2 className="text-xl font-bold">聯絡方式</h2>

                        <div className="space-y-4">
                            <div>
                                <Label className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    value={profile.contact.email}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            contact: { ...profile.contact, email: e.target.value },
                                        })
                                    }
                                    placeholder="your@email.com"
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    電話
                                </Label>
                                <Input
                                    type="tel"
                                    value={profile.contact.phone}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            contact: { ...profile.contact, phone: e.target.value },
                                        })
                                    }
                                    placeholder="+886 912-345-678"
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    個人網站 / 作品集網址（可選）
                                </Label>
                                <Input
                                    type="url"
                                    value={profile.contact.website}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            contact: { ...profile.contact, website: e.target.value },
                                        })
                                    }
                                    placeholder="https://your-portfolio.com"
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-6">
                        <h2 className="text-xl font-bold">收費範圍（可選）</h2>
                        <p className="text-sm text-gray-600">
                            設定您的基本收費範圍，讓主辦方更容易評估
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Label>最低收費</Label>
                                <Input
                                    type="number"
                                    value={profile.pricing.min}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            pricing: { ...profile.pricing, min: e.target.value },
                                        })
                                    }
                                    placeholder="3000"
                                    className="mt-2"
                                />
                            </div>
                            <span className="text-gray-400 mt-8">-</span>
                            <div className="flex-1">
                                <Label>最高收費</Label>
                                <Input
                                    type="number"
                                    value={profile.pricing.max}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            pricing: { ...profile.pricing, max: e.target.value },
                                        })
                                    }
                                    placeholder="10000"
                                    className="mt-2"
                                />
                            </div>
                            <div className="w-24 mt-8">
                                <select
                                    value={profile.pricing.currency}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            pricing: { ...profile.pricing, currency: e.target.value },
                                        })
                                    }
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
                                >
                                    <option value="TWD">TWD</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-[24px] p-6">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 個人檔案提示</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• 完整的個人檔案能提高申請通過率</li>
                            <li>• 作品集是展示專業能力的最佳方式</li>
                            <li>• 明確的收費範圍有助於主辦方快速決策</li>
                            <li>• 確保聯絡方式正確，以免錯過合作機會</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
