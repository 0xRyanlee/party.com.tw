import { Shield, Lock, Eye, Database, UserCheck, Mail, Globe } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | 隱私權政策 - Party Taiwan',
    description: 'Learn how Party Taiwan collects, uses, and protects your personal data. 了解 Party 如何收集、使用和保護您的個人資料。',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <Shield className="w-16 h-16 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">Privacy Policy</h1>
                        <p className="text-2xl opacity-80 mb-4">隱私權政策</p>
                        <p className="text-lg opacity-70">
                            Last Updated: December 17, 2025 | 最後更新：2025年12月17日
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 md:p-12 shadow-sm">
                    {/* Introduction */}
                    <section className="mb-12">
                        <p className="text-lg text-gray-700 leading-relaxed mb-4">
                            Party Taiwan (&quot;we&quot;, &quot;us&quot;, or &quot;the Platform&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our services.
                        </p>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Party（以下簡稱「本平台」）重視您的隱私權。本隱私權政策說明我們如何收集、使用、儲存和保護您的個人資料。使用本平台即表示您同意本政策的條款。
                        </p>
                    </section>

                    {/* Google OAuth Section - REQUIRED FOR GOOGLE VERIFICATION */}
                    <section className="mb-12 p-6 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-blue-900">Third-Party Authentication | 第三方登入</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p className="font-medium">
                                We use Google OAuth for authentication. When you sign in with Google:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>We only access your <strong>basic profile information</strong> (email address, name, and profile picture) for account identification purposes.</li>
                                <li>We do <strong>not</strong> access your Google Drive, Gmail, Calendar, or any other Google services.</li>
                                <li>We do <strong>not</strong> post anything on your behalf or access your contacts.</li>
                                <li>You can revoke access at any time via your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Account Permissions</a>.</li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-blue-200">
                                <p className="text-gray-600">
                                    我們使用 Google OAuth 進行身份驗證。當您使用 Google 登入時，我們僅存取您的基本個人資料（電子郵件、姓名和頭像）用於帳號識別。我們不會存取您的 Google 雲端硬碟、Gmail、日曆或其他 Google 服務。您可以隨時透過 Google 帳戶設定撤銷存取權限。
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 1 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">1. Information We Collect | 資料收集範圍</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p><strong>Account Information:</strong> Name, email address, profile picture (when you register via Google, Line, or Email)</p>
                            <p><strong>Event Data:</strong> Events you create, register for, or interact with</p>
                            <p><strong>Usage Data:</strong> Browsing history, click behavior, device information, IP address</p>
                            <p><strong>Cookies:</strong> Used to maintain login sessions and improve user experience</p>
                            <div className="mt-4 pt-4 border-t border-gray-100 text-gray-500 text-sm">
                                <p>帳號資訊：姓名、Email、頭像 | 活動資訊：您創建或報名的活動 | 使用資料：瀏覽記錄、裝置資訊 | Cookie：維持登入狀態</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">2. How We Use Your Information | 資料使用方式</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>To provide and improve our platform services</li>
                                <li>To process event registrations and management</li>
                                <li>To send event notifications and important updates</li>
                                <li>To analyze usage trends and optimize features</li>
                                <li>To prevent fraud and abuse</li>
                            </ul>
                            <p className="mt-4 font-semibold">
                                We do NOT sell your personal data to third parties.
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-100 text-gray-500 text-sm">
                                <p>提供服務 | 處理報名 | 發送通知 | 分析優化 | 防止濫用 — 我們不會出售您的個人資料。</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">3. Cookies & Tracking | Cookie 政策</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Essential Cookies:</strong> Required for login and core functionality</li>
                                <li><strong>Analytics Cookies:</strong> Google Analytics for usage insights</li>
                                <li><strong>Functional Cookies:</strong> Remember your preferences</li>
                            </ul>
                            <p className="mt-4">
                                You can manage cookies through your browser settings. Disabling cookies may affect some features.
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">4. Third-Party Services | 第三方服務</h2>
                        </div>
                        <div className="space-y-6 text-gray-700">
                            <p>We integrate with the following third-party services. Each has their own privacy policy that governs their use of your data:</p>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold mb-2">🔐 Authentication Services | 身份驗證服務</h4>
                                    <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                        <li><strong>Google OAuth:</strong> Used for &quot;Sign in with Google&quot;. Only basic profile info (email, name, avatar) is accessed. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Privacy Policy</a></li>
                                        <li><strong>Line Login:</strong> Used for &quot;Sign in with Line&quot;. Only profile info is accessed. <a href="https://terms.line.me/line_rules" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Line Privacy Policy</a></li>
                                        <li><strong>Supabase Auth:</strong> Manages authentication and session tokens. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Privacy Policy</a></li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold mb-2">☁️ Infrastructure Services | 基礎設施服務</h4>
                                    <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                        <li><strong>Vercel:</strong> Website hosting and serverless functions. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vercel Privacy Policy</a></li>
                                        <li><strong>Supabase:</strong> Database, storage, and backend services. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Privacy Policy</a></li>
                                        <li><strong>GitHub:</strong> Source code repository and version control. <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub Privacy Statement</a></li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold mb-2">📊 Analytics & Maps | 分析與地圖</h4>
                                    <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                        <li><strong>Google Analytics:</strong> Website usage analytics. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Privacy Policy</a></li>
                                        <li><strong>Google Maps API:</strong> Location and map services. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Privacy Policy</a></li>
                                        <li><strong>Vercel Analytics:</strong> Performance monitoring. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vercel Privacy Policy</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white">
                                <p className="text-sm">
                                    <strong>About Antigravity:</strong> Party Taiwan is developed and operated by Antigravity. We are committed to protecting your privacy and handling your data responsibly. For any privacy-related inquiries, contact us at <a href="mailto:support@party.com.tw" className="text-blue-600 hover:underline">support@party.com.tw</a>.
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    <strong>關於 Antigravity：</strong>Party Taiwan 由 Antigravity 開發和營運。我們致力於保護您的隱私並負責任地處理您的資料。
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">5. Data Security | 資料安全</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>HTTPS encryption for all data transmission</li>
                                <li>Row Level Security (RLS) database access control</li>
                                <li>Regular data backups</li>
                                <li>Restricted employee access</li>
                            </ul>
                            <p className="mt-4 text-sm text-gray-500">
                                While we implement industry-standard security measures, no system is 100% secure. Please protect your login credentials.
                            </p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">6. Your Rights | 您的權利</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Under applicable data protection laws, you have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Rectification:</strong> Correct inaccurate information</li>
                                <li><strong>Erasure:</strong> Request deletion of your account and data</li>
                                <li><strong>Portability:</strong> Export your data</li>
                                <li><strong>Withdraw Consent:</strong> Revoke data processing consent at any time</li>
                            </ul>
                            <p className="mt-4">
                                To exercise these rights, contact us at <a href="mailto:support@party.com.tw" className="text-gray-900 hover:underline">support@party.com.tw</a>
                            </p>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">7. Children&apos;s Privacy | 兒童隱私</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Our platform is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If we discover we have collected data from a child, we will delete it immediately.
                            </p>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">8. Policy Updates | 政策更新</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                We may update this Privacy Policy from time to time. For significant changes, we will notify you via email or platform notification. Continued use of the platform after changes constitutes acceptance of the updated policy.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold mb-4">Contact Us | 聯絡我們</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>For questions about this Privacy Policy:</p>
                            <p><strong>Email:</strong> <a href="mailto:support@party.com.tw" className="text-gray-900 hover:underline">support@party.com.tw</a></p>
                            <p><strong>Location:</strong> Taipei, Taiwan</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
