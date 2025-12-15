import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Logo />
                        <p className="text-gray-500 text-sm leading-relaxed">
                            城市活動行事曆<br />
                            連接、慶祝、創造難忘回憶
                        </p>
                        <p className="text-xs text-gray-400 italic">
                            Meetup, Anytime, Anywhere
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900">平台</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                                    首頁
                                </Link>
                            </li>
                            <li>
                                <Link href="/map" className="text-gray-600 hover:text-black transition-colors">
                                    地圖檢視
                                </Link>
                            </li>
                            <li>
                                <Link href="/host" className="text-gray-600 hover:text-black transition-colors">
                                    主辦方入口
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900">支援</h4>
                        <ul className="space-y-2 text-sm">
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
                        <h4 className="font-semibold mb-4 text-gray-900">法律條款</h4>
                        <ul className="space-y-2 text-sm">
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
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <p>© {new Date().getFullYear()} Party Taiwan. All rights reserved.</p>
                    <p>活動資料來源為各主辦方所有</p>
                </div>
            </div>
        </footer>
    );
}
