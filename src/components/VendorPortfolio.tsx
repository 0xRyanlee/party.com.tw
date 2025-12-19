'use client';

import StructuredImage from '@/components/common/StructuredImage';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface PortfolioItem {
    title: string;
    description: string;
    image?: string;
    date?: string;
    link?: string;
}

interface VendorPortfolioProps {
    items: PortfolioItem[];
    title?: string;
}

export default function VendorPortfolio({ items, title = "精選案例 Portfolio" }: VendorPortfolioProps) {
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                    <Card
                        key={index}
                        className="group overflow-hidden border-none shadow-none bg-neutral-50 rounded-3xl cursor-pointer hover:bg-neutral-100 transition-all"
                        onClick={() => setSelectedItem(item)}
                    >
                        <div className="aspect-[4/3] relative overflow-hidden">
                            {item.image ? (
                                <StructuredImage
                                    src={item.image}
                                    alt={item.title}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-200 text-neutral-400">
                                    <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                                    <span className="text-xs font-medium">無圖片範例</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                        <CardContent className="p-5">
                            <h4 className="font-bold text-lg text-neutral-900 line-clamp-1">{item.title}</h4>
                            <p className="text-sm text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                                {item.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Lightbox / Detail Modal (Simplified for now) */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="max-w-4xl w-full bg-white rounded-[32px] overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                        <div className="md:w-3/5 bg-neutral-100">
                            {selectedItem.image ? (
                                <img
                                    src={selectedItem.image}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full aspect-square flex items-center justify-center text-neutral-300">
                                    <ImageIcon className="w-20 h-20 opacity-10" />
                                </div>
                            )}
                        </div>
                        <div className="md:w-2/5 p-8 md:p-12 space-y-6 overflow-y-auto">
                            <div>
                                <Badge variant="outline" className="mb-4 border-neutral-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
                                    Case Study
                                </Badge>
                                <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                                    {selectedItem.title}
                                </h3>
                            </div>

                            <p className="text-neutral-600 leading-relaxed text-lg">
                                {selectedItem.description}
                            </p>

                            {selectedItem.link && (
                                <a
                                    href={selectedItem.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-neutral-900 font-bold border-b-2 border-neutral-900 pb-1 hover:opacity-70 transition-opacity"
                                >
                                    查看完整案例 <ExternalLink className="w-4 h-4" />
                                </a>
                            )}

                            <div className="pt-8 mt-8 border-t border-neutral-100">
                                <p className="text-sm text-neutral-400 font-medium">
                                    分享這個案例：
                                </p>
                                <div className="flex gap-4 mt-4 text-neutral-400">
                                    {/* Mock Social Icons */}
                                    <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer">IG</div>
                                    <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer">FB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
