'use client';

import { useState } from 'react';
import { ChevronDown, Mail, MessageCircle, Book } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const faqs = [
    {
        category: '帳號相關',
        questions: [
            {
                q: '如何註冊帳號？',
                a: '點擊右上角的「登入」按鈕，選擇使用 Google、Email 或 Line 註冊。註冊過程簡單快速，無需繁瑣流程。'
            },
            {
                q: '忘記密碼怎麼辦？',
                a: '如果您使用 Email 註冊，可以使用 Magic Link 登入，無需密碼。系統會發送登入連結到您的信箱。'
            },
            {
                q: '如何刪除帳號？',
                a: '前往「設定」頁面，在「帳號管理」區塊中選擇「刪除帳號」。請注意，此操作無法復原。'
            }
        ]
    },
    {
        category: '活動報名',
        questions: [
            {
                q: '如何報名活動？',
                a: '在活動詳情頁點擊「報名參加」按鈕，確認報名資訊後即可完成報名。系統會發送確認郵件到您的信箱。'
            },
            {
                q: '可以取消報名嗎？',
                a: '可以。在「我的活動」頁面找到該活動，點擊「取消報名」。請注意活動的取消政策，部分活動可能有取消期限。'
            },
            {
                q: '候補名單是什麼？',
                a: '當活動人數已滿時，您可以加入候補名單。若有人取消報名，系統會自動通知候補名單上的參與者。'
            },
            {
                q: '如何查看我報名的活動？',
                a: '點擊右上角頭像，選擇「我的活動」，即可查看所有已報名和已參加的活動。'
            }
        ]
    },
    {
        category: '發起活動',
        questions: [
            {
                q: '如何發起活動？',
                a: '點擊導航欄的「主辦方」或右上角的「+」按鈕，填寫活動資訊後即可發布。您可以先儲存為草稿，稍後再發布。'
            },
            {
                q: '發起活動需要付費嗎？',
                a: '目前發起活動完全免費。未來可能會推出進階功能的付費方案。'
            },
            {
                q: '如何編輯已發布的活動？',
                a: '前往「主辦方儀表板」，找到該活動，點擊「編輯」即可修改活動資訊。'
            },
            {
                q: '可以取消活動嗎？',
                a: '可以。在活動管理頁面選擇「取消活動」，系統會自動通知所有已報名的參與者。'
            }
        ]
    },
    {
        category: '付款與退款',
        questions: [
            {
                q: '支援哪些付款方式？',
                a: '目前平台上的活動多為免費。付費活動將在未來支援信用卡、Line Pay 等付款方式。'
            },
            {
                q: '如何申請退款？',
                a: '請聯絡活動主辦方或透過「聯絡我們」頁面提交退款申請。退款政策依各活動而異。'
            }
        ]
    },
    {
        category: '技術問題',
        questions: [
            {
                q: '無法登入怎麼辦？',
                a: '請確認您使用的登入方式正確。如果問題持續，請清除瀏覽器快取或嘗試使用其他瀏覽器。'
            },
            {
                q: '沒有收到確認郵件？',
                a: '請檢查垃圾郵件資料夾。如果仍未收到，請透過「聯絡我們」頁面聯繫我們。'
            },
            {
                q: '手機版可以使用嗎？',
                a: '可以！Party 平台完全支援手機瀏覽器，提供流暢的行動體驗。'
            }
        ]
    }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex items-center justify-between text-left hover:text-purple-600 transition-colors"
            >
                <span className="font-medium pr-4">{question}</span>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 text-gray-600 leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
}

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">幫助中心</h1>
                        <p className="text-xl opacity-90">
                            找到您需要的答案，或聯繫我們獲得協助
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="container mx-auto px-4 -mt-8">
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
                    <Link href="/contact" className="bg-white p-6 rounded-[16px] shadow-sm hover:shadow-md transition-shadow">
                        <Mail className="w-8 h-8 text-purple-600 mb-3" />
                        <h3 className="font-bold mb-1">聯絡我們</h3>
                        <p className="text-sm text-gray-600">發送訊息給我們</p>
                    </Link>
                    <Link href="/host" className="bg-white p-6 rounded-[16px] shadow-sm hover:shadow-md transition-shadow">
                        <Book className="w-8 h-8 text-purple-600 mb-3" />
                        <h3 className="font-bold mb-1">主辦方指南</h3>
                        <p className="text-sm text-gray-600">學習如何發起活動</p>
                    </Link>
                    <a href="mailto:support@party.com.tw" className="bg-white p-6 rounded-[16px] shadow-sm hover:shadow-md transition-shadow">
                        <MessageCircle className="w-8 h-8 text-purple-600 mb-3" />
                        <h3 className="font-bold mb-1">Email 支援</h3>
                        <p className="text-sm text-gray-600">support@party.com.tw</p>
                    </a>
                </div>
            </div>

            {/* FAQ Sections */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-center">常見問題</h2>
                    <div className="space-y-8">
                        {faqs.map((category, idx) => (
                            <div key={idx} className="bg-white rounded-[16px] p-6 shadow-sm">
                                <h3 className="text-xl font-bold mb-4 text-purple-600">
                                    {category.category}
                                </h3>
                                <div>
                                    {category.questions.map((faq, faqIdx) => (
                                        <FAQItem
                                            key={faqIdx}
                                            question={faq.q}
                                            answer={faq.a}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact CTA */}
            <div className="container mx-auto px-4 pb-16">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-[24px] p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        找不到答案？
                    </h2>
                    <p className="text-lg mb-6 opacity-90">
                        我們的團隊隨時準備協助您
                    </p>
                    <Link href="/contact">
                        <Button size="lg" className="rounded-full bg-white text-purple-600 hover:bg-gray-100">
                            聯絡我們
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
