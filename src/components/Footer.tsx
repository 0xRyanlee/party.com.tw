import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
            <div className="container mx-auto px-4">
                {/* Brand - 僅桌面顯示 */}
                <div className="hidden md:block mb-8">
                    <div className="space-y-4 max-w-xs">
                        <Logo />
                        <p className="text-gray-500 text-sm leading-relaxed">
                            城市活動行事曆<br />
                            連接、慶祝、創造難忘回憶
                        </p>
                        <p className="text-xs text-gray-400 italic">
                            Meetup, Anytime, Anywhere
                        </p>
                    </div>
                </div>

                {/* Mobile: Logo 居中 */}
                <div className="md:hidden text-center mb-8">
                    <div className="inline-block">
                        <Logo />
                    </div>
                    <p className="text-gray-500 text-sm mt-2">城市活動行事曆</p>
                    <p className="text-xs text-gray-400 italic">連接、慶祝、創造難忘回憶</p>
                </div>

                {/* 三欄連結區 - 手機並排置中，桌面正常 */}
                <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8 text-center md:text-left max-w-lg md:max-w-3xl mx-auto md:mx-0">
                    {/* Platform */}
                    <div>
                        <h4 className="font-semibold mb-3 md:mb-4 text-gray-900 text-sm md:text-base">平台</h4>
                        <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                            <li>
                                <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                                    首頁
                                </Link>
                            </li>
                            <li>
                                <Link href="/discover" className="text-gray-600 hover:text-black transition-colors">
                                    探索活動
                                </Link>
                            </li>
                            <li>
                                <Link href="/host/edit" className="text-gray-600 hover:text-black transition-colors">
                                    發起活動
                                </Link>
                            </li>
                            <li>
                                <Link href="/club" className="text-gray-600 hover:text-black transition-colors">
                                    社群俱樂部
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-3 md:mb-4 text-gray-900 text-sm md:text-base">支援</h4>
                        <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                            <li>
                                <Link href="/help" className="text-gray-600 hover:text-black transition-colors">
                                    幫助中心
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 hover:text-black transition-colors">
                                    聯絡我們
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-3 md:mb-4 text-gray-900 text-sm md:text-base">法律條款</h4>
                        <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                            <li>
                                <Link href="/terms" className="text-gray-600 hover:text-black transition-colors">
                                    服務條款
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-600 hover:text-black transition-colors">
                                    隱私權政策
                                </Link>
                            </li>
                            <li>
                                <Link href="/disclaimer" className="text-gray-600 hover:text-black transition-colors">
                                    免責聲明
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 mt-8 border-t border-gray-100 text-center text-xs text-gray-400 space-y-1">
                    <p>© {new Date().getFullYear()} Party Taiwan. All rights reserved.</p>
                    <p>活動資料來源為各主辦方所有</p>
                </div>
            </div>
        </footer>
    );
}

