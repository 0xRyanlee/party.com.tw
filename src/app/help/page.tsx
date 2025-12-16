'use client';

import { useState } from 'react';
import { ChevronDown, Mail, MessageCircle, Book, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const faqs = [
    {
        category: 'Account | 帳號相關',
        questions: [
            {
                q: 'How do I create an account? | 如何註冊帳號？',
                a: 'Click the "Sign In" button in the top right corner and choose to register with Google, Email, or Line. The registration process is quick and simple.\n\n點擊右上角的「登入」按鈕，選擇使用 Google、Email 或 Line 註冊。註冊過程簡單快速。'
            },
            {
                q: 'What if I forgot my password? | 忘記密碼怎麼辦？',
                a: 'If you registered with Email, you can use Magic Link to sign in without a password. We\'ll send a login link to your email.\n\n如果您使用 Email 註冊，可以使用 Magic Link 登入，無需密碼。系統會發送登入連結到您的信箱。'
            },
            {
                q: 'How do I delete my account? | 如何刪除帳號？',
                a: 'Go to "Settings" page and select "Delete Account" in the Account Management section. Please note this action cannot be undone.\n\n前往「設定」頁面，在「帳號管理」區塊中選擇「刪除帳號」。請注意，此操作無法復原。'
            }
        ]
    },
    {
        category: 'Event Registration | 活動報名',
        questions: [
            {
                q: 'How do I register for an event? | 如何報名活動？',
                a: 'Click the "Register" button on the event detail page, confirm your information, and you\'re done! You\'ll receive a confirmation email.\n\n在活動詳情頁點擊「報名參加」按鈕，確認報名資訊後即可完成。系統會發送確認郵件。'
            },
            {
                q: 'Can I cancel my registration? | 可以取消報名嗎？',
                a: 'Yes. Find the event in "My Events" and click "Cancel Registration". Please note some events may have cancellation policies.\n\n可以。在「我的活動」頁面找到該活動，點擊「取消報名」。請注意活動可能有取消政策。'
            },
            {
                q: 'What is the waitlist? | 候補名單是什麼？',
                a: 'When an event is full, you can join the waitlist. If someone cancels, the system will automatically notify people on the waitlist.\n\n當活動人數已滿時，您可以加入候補名單。若有人取消報名，系統會自動通知。'
            }
        ]
    },
    {
        category: 'Hosting Events | 發起活動',
        questions: [
            {
                q: 'How do I create an event? | 如何發起活動？',
                a: 'Click "Host" in the navigation bar or the "+" button, fill in the event details, and publish. You can save as draft first.\n\n點擊導航欄的「主辦方」或「+」按鈕，填寫活動資訊後發布。可先儲存為草稿。'
            },
            {
                q: 'Is there a fee to create events? | 發起活動需要付費嗎？',
                a: 'Currently, creating events is completely free. We may introduce premium features in the future.\n\n目前發起活動完全免費。未來可能會推出進階付費功能。'
            },
            {
                q: 'How do I edit a published event? | 如何編輯已發布的活動？',
                a: 'Go to your "Host Dashboard", find the event, and click "Edit" to modify event information.\n\n前往「主辦方儀表板」，找到該活動，點擊「編輯」即可修改。'
            }
        ]
    },
    {
        category: 'Payment & Refunds | 付款與退款',
        questions: [
            {
                q: 'What payment methods are supported? | 支援哪些付款方式？',
                a: 'Most events on the platform are currently free. Paid events will support credit cards and Line Pay in the future.\n\n目前平台上的活動多為免費。付費活動將支援信用卡、Line Pay 等。'
            },
            {
                q: 'How do I request a refund? | 如何申請退款？',
                a: 'Please contact the event host directly or submit a request through our "Contact Us" page. Refund policies vary by event.\n\n請聯絡活動主辦方或透過「聯絡我們」頁面提交申請。退款政策依各活動而異。'
            }
        ]
    },
    {
        category: 'Technical Issues | 技術問題',
        questions: [
            {
                q: 'I can\'t sign in. What should I do? | 無法登入怎麼辦？',
                a: 'Make sure you\'re using the correct sign-in method. Try clearing your browser cache or using a different browser.\n\n請確認登入方式正確。可嘗試清除瀏覽器快取或使用其他瀏覽器。'
            },
            {
                q: 'I didn\'t receive a confirmation email. | 沒有收到確認郵件？',
                a: 'Check your spam folder. If you still haven\'t received it, contact us through the "Contact Us" page.\n\n請檢查垃圾郵件資料夾。如仍未收到，請透過「聯絡我們」聯繫。'
            },
            {
                q: 'Does Party work on mobile? | 手機版可以使用嗎？',
                a: 'Yes! Party fully supports mobile browsers with a smooth mobile experience.\n\n可以！Party 完全支援手機瀏覽器，提供流暢的行動體驗。'
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
                className="w-full py-4 flex items-center justify-between text-left hover:text-gray-600 transition-colors"
            >
                <span className="font-medium pr-4">{question}</span>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 text-gray-600 leading-relaxed whitespace-pre-line">
                    {answer}
                </div>
            )}
        </div>
    );
}

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <HelpCircle className="w-16 h-16 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">Help Center</h1>
                        <p className="text-2xl opacity-80 mb-4">幫助中心</p>
                        <p className="text-lg opacity-70">
                            Find answers or contact us for assistance
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="container mx-auto px-4 -mt-8">
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
                    <Link href="/contact" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Mail className="w-8 h-8 text-gray-600 mb-3" />
                        <h3 className="font-bold mb-1">Contact Us | 聯絡我們</h3>
                        <p className="text-sm text-gray-600">Send us a message</p>
                    </Link>
                    <Link href="/host" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Book className="w-8 h-8 text-gray-600 mb-3" />
                        <h3 className="font-bold mb-1">Host Guide | 主辦方指南</h3>
                        <p className="text-sm text-gray-600">Learn how to create events</p>
                    </Link>
                    <a href="mailto:support@party.com.tw" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <MessageCircle className="w-8 h-8 text-gray-600 mb-3" />
                        <h3 className="font-bold mb-1">Email Support</h3>
                        <p className="text-sm text-gray-600">support@party.com.tw</p>
                    </a>
                </div>
            </div>

            {/* FAQ Sections */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h2>
                    <p className="text-center text-gray-500 mb-8">常見問題</p>
                    <div className="space-y-8">
                        {faqs.map((category, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold mb-4 text-gray-900">
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
                <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        Can&apos;t find an answer?
                    </h2>
                    <p className="text-xl opacity-80 mb-4">找不到答案？</p>
                    <p className="text-lg mb-6 opacity-70">
                        Our team is ready to help you
                    </p>
                    <Link href="/contact">
                        <Button size="lg" className="rounded-full bg-white text-gray-900 hover:bg-gray-100">
                            Contact Us | 聯絡我們
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
