import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <Shield className="w-16 h-16 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">隱私權政策</h1>
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
                            Party（以下簡稱「本平台」）重視您的隱私權。本隱私權政策說明我們如何收集、使用、儲存和保護您的個人資料。
                            使用本平台即表示您同意本政策的條款。
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">1. 資料收集範圍</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>我們收集以下類型的資料：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>帳號資訊</strong>：姓名、Email、頭像（透過 Google、Line 或 Email 註冊時提供）</li>
                                <li><strong>活動資訊</strong>：您創建或報名的活動資料</li>
                                <li><strong>使用資料</strong>：瀏覽記錄、點擊行為、裝置資訊</li>
                                <li><strong>Cookie</strong>：用於維持登入狀態和改善使用體驗</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">2. 資料使用方式</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>我們使用您的資料用於：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>提供和改善平台服務</li>
                                <li>處理活動報名和管理</li>
                                <li>發送活動通知和重要訊息</li>
                                <li>分析使用趨勢以優化功能</li>
                                <li>防止詐欺和濫用行為</li>
                            </ul>
                            <p className="mt-4">
                                <strong>我們不會</strong>將您的個人資料出售給第三方。
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">3. Cookie 政策</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>本平台使用 Cookie 來：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>必要 Cookie</strong>：維持登入狀態、記住您的偏好設定</li>
                                <li><strong>分析 Cookie</strong>：了解使用者行為，改善服務（Google Analytics）</li>
                                <li><strong>功能 Cookie</strong>：提供個人化體驗</li>
                            </ul>
                            <p className="mt-4">
                                您可以透過瀏覽器設定管理或停用 Cookie，但這可能影響部分功能的使用。
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">4. 第三方服務</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>本平台整合以下第三方服務，它們有各自的隱私政策：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Supabase</strong>：資料庫和認證服務</li>
                                <li><strong>Google</strong>：OAuth 登入、Maps API、Analytics</li>
                                <li><strong>Line</strong>：Line Login 認證</li>
                                <li><strong>Vercel</strong>：網站託管和分析</li>
                            </ul>
                            <p className="mt-4">
                                使用這些服務時，您的資料可能會被傳輸至這些服務提供商。
                            </p>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">5. 資料安全</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>我們採取以下措施保護您的資料：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>使用 HTTPS 加密傳輸</li>
                                <li>實施 Row Level Security (RLS) 資料庫權限控制</li>
                                <li>定期備份資料</li>
                                <li>限制員工存取權限</li>
                            </ul>
                            <p className="mt-4">
                                儘管我們盡力保護您的資料，但無法保證絕對安全。請妥善保管您的帳號密碼。
                            </p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">6. 您的權利</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>根據個人資料保護法，您有權：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>查看</strong>：要求查看我們持有的您的個人資料</li>
                                <li><strong>修改</strong>：更正不正確的資料</li>
                                <li><strong>刪除</strong>：要求刪除您的帳號和資料</li>
                                <li><strong>匯出</strong>：要求匯出您的資料</li>
                                <li><strong>撤回同意</strong>：隨時撤回對資料處理的同意</li>
                            </ul>
                            <p className="mt-4">
                                如需行使這些權利，請透過 <a href="mailto:support@party.com.tw" className="text-gray-900 hover:underline">support@party.com.tw</a> 聯絡我們。
                            </p>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">7. 兒童隱私</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                本平台不針對 13 歲以下兒童。如果我們發現收集了兒童的資料，將立即刪除。
                            </p>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">8. 政策更新</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                我們可能會不時更新本隱私權政策。重大變更時，我們會透過 Email 或平台通知您。
                                繼續使用本平台即表示您接受更新後的政策。
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold mb-4">聯絡我們</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>如對本隱私權政策有任何疑問，請聯絡：</p>
                            <p><strong>Email</strong>: <a href="mailto:support@party.com.tw" className="text-gray-900 hover:underline">support@party.com.tw</a></p>
                            <p><strong>地址</strong>: 台北市, 台灣</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
