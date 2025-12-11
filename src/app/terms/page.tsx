import { FileText, AlertTriangle, Scale, Users, Ban, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">服務條款</h1>
                        <p className="text-xl opacity-90">
                            最後更新：2025年12月3日
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 md:p-12 shadow-sm">
                    {/* Introduction */}
                    <section className="mb-12">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            歡迎使用 Party 平台（以下簡稱「本平台」）。使用本平台即表示您同意遵守以下服務條款。
                            請仔細閱讀本條款，如不同意請勿使用本平台。
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">1. 服務說明</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>本平台提供以下服務：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>活動資訊瀏覽與搜尋</li>
                                <li>活動報名與管理</li>
                                <li>活動發起與推廣</li>
                                <li>參與者互動與社群功能</li>
                            </ul>
                            <p className="mt-4">
                                本平台保留隨時修改、暫停或終止任何服務的權利，恕不另行通知。
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">2. 用戶責任</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>使用本平台時，您同意：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>提供真實、準確的個人資訊</li>
                                <li>妥善保管帳號密碼，不與他人共享</li>
                                <li>對您帳號下的所有活動負責</li>
                                <li>不從事任何違法或不當行為</li>
                                <li>尊重其他用戶的權利和隱私</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">3. 活動發起規範</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>發起活動時，您必須：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>提供真實、完整的活動資訊</li>
                                <li>確保活動內容合法且不違反公序良俗</li>
                                <li>履行對參與者的承諾</li>
                                <li>及時更新活動變更資訊</li>
                                <li>妥善處理參與者的報名和退款</li>
                            </ul>
                            <p className="mt-4">
                                本平台有權審核、修改或刪除任何不符合規範的活動。
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Ban className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">4. 禁止行為</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>以下行為嚴格禁止：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>發布虛假、誤導性資訊</li>
                                <li>騷擾、威脅或侮辱其他用戶</li>
                                <li>侵犯他人智慧財產權</li>
                                <li>散布病毒、惡意程式或垃圾訊息</li>
                                <li>試圖破壞平台安全或功能</li>
                                <li>未經授權存取他人帳號或資料</li>
                                <li>進行詐欺、洗錢或其他非法活動</li>
                            </ul>
                            <p className="mt-4">
                                違反者將被暫停或終止帳號，並可能面臨法律追訴。
                            </p>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">5. 智慧財產權</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                本平台的所有內容（包括但不限於文字、圖片、Logo、程式碼）均受智慧財產權法保護。
                                未經授權，不得複製、修改、散布或用於商業用途。
                            </p>
                            <p className="mt-4">
                                您上傳的內容（如活動資訊、圖片）仍屬於您，但您授予本平台使用、展示和推廣的權利。
                            </p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">6. 免責聲明</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>本平台：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>不保證服務不中斷或無錯誤</li>
                                <li>不對活動主辦方的行為負責</li>
                                <li>不對用戶間的交易或糾紛負責</li>
                                <li>不保證活動資訊的準確性</li>
                            </ul>
                            <p className="mt-4">
                                使用本平台的風險由您自行承擔。在法律允許的範圍內，本平台不承擔任何直接、間接、附帶或衍生的損害賠償責任。
                            </p>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">7. 退款政策</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                退款政策由各活動主辦方自行決定。本平台僅提供平台服務，不介入退款流程。
                                如有退款爭議，請直接聯絡活動主辦方。
                            </p>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">8. 隱私權</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                我們重視您的隱私。請參閱我們的{' '}
                                <Link href="/privacy" className="text-gray-900 hover:underline">
                                    隱私權政策
                                </Link>
                                {' '}了解我們如何收集、使用和保護您的個人資料。
                            </p>
                        </div>
                    </section>

                    {/* Section 9 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">9. 條款變更</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                本平台保留隨時修改本服務條款的權利。重大變更時，我們會透過 Email 或平台通知您。
                                繼續使用本平台即表示您接受更新後的條款。
                            </p>
                        </div>
                    </section>

                    {/* Section 10 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">10. 準據法與管轄</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                本服務條款受中華民國法律管轄。因本條款產生的任何爭議，雙方同意以台灣台北地方法院為第一審管轄法院。
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold mb-4">聯絡我們</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>如對本服務條款有任何疑問，請聯絡：</p>
                            <p><strong>Email</strong>: <a href="mailto:support@party.com.tw" className="text-gray-900 hover:underline">support@party.com.tw</a></p>
                            <p><strong>地址</strong>: 台北市, 台灣</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
