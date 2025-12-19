import { AlertTriangle, Scale, Shield, Building, UserX, Server, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Disclaimer | 免責聲明 - Party Taiwan',
    description: 'Legal disclaimer for Party Taiwan platform. Party 平台法律免責聲明。',
};

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">Disclaimer</h1>
                        <p className="text-2xl opacity-80 mb-4">免責聲明</p>
                        <p className="text-lg opacity-70">
                            Last Updated: December 20, 2025 | 最後更新：2025年12月20日
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 md:p-12 shadow-sm">
                    {/* Introduction - English */}
                    <section className="mb-8">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            This Disclaimer governs your use of Party Taiwan (&quot;the Platform&quot;). By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by this Disclaimer in its entirety.
                        </p>
                    </section>

                    {/* Introduction - Chinese */}
                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <p className="text-lg text-gray-500 leading-relaxed">
                            本免責聲明規範您對 Party 平台（以下簡稱「本平台」）的使用。存取或使用我們的服務即表示您已閱讀、理解並同意完全遵守本免責聲明。
                        </p>
                    </section>

                    {/* Section 1 - Platform Nature */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Building className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">1. Nature of the Platform</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Party Taiwan is an information platform that:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provides a venue for event discovery and registration</li>
                                <li>Acts as an intermediary between event hosts and participants</li>
                                <li>Does NOT organize, host, or control any events listed on the platform</li>
                                <li>Does NOT guarantee the occurrence, quality, or safety of any events</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">1. 平台性質</h3>
                        <div className="space-y-4 text-gray-500">
                            <p>Party 是一個資訊平台：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li>提供活動探索與報名的場所</li>
                                <li>作為活動主辦方與參與者之間的中介</li>
                                <li>不主辦、籌辦或控制平台上列出的任何活動</li>
                                <li>不擔保任何活動的舉行、品質或安全</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 2 - Content Disclaimer */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <ExternalLink className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">2. Content Disclaimer</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Regarding content on our platform:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>User-Generated Content:</strong> Event listings are created by third-party hosts. We do not verify the accuracy or completeness of this information.</li>
                                <li><strong>Aggregated Content:</strong> Some listings may be sourced from external websites or APIs. We are not responsible for the accuracy of such content.</li>
                                <li><strong>No Endorsement:</strong> Listing an event does not constitute an endorsement or recommendation by Party Taiwan.</li>
                                <li><strong>External Links:</strong> Links to third-party websites are provided for convenience. We are not responsible for their content or privacy practices.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">2. 內容免責</h3>
                        <div className="space-y-4 text-gray-500">
                            <p>關於本平台上的內容：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li><strong>使用者生成內容：</strong>活動列表由第三方主辦方建立。我們不驗證此資訊的準確性或完整性。</li>
                                <li><strong>聚合內容：</strong>部分列表可能來自外部網站或 API。我們對此類內容的準確性不負責任。</li>
                                <li><strong>無背書：</strong>列出活動並不構成 Party 的背書或推薦。</li>
                                <li><strong>外部連結：</strong>第三方網站連結僅為方便提供。我們對其內容或隱私做法不負責任。</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 - Limitation of Liability */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">3. Limitation of Liability</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>To the maximum extent permitted by applicable law, Party Taiwan shall not be liable for:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Any direct, indirect, incidental, special, consequential, or punitive damages</li>
                                <li>Loss of profits, revenue, data, or business opportunities</li>
                                <li>Personal injury or property damage arising from event attendance</li>
                                <li>Actions or omissions of event hosts or other users</li>
                                <li>Service interruptions, delays, or errors</li>
                                <li>Unauthorized access to user accounts or data</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">3. 責任限制</h3>
                        <div className="space-y-4 text-gray-500">
                            <p>在適用法律允許的最大範圍內，Party 不對以下事項負責：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li>任何直接、間接、附帶、特殊、後果性或懲罰性損害</li>
                                <li>利潤、收入、資料或商業機會的損失</li>
                                <li>因參加活動而造成的人身傷害或財產損失</li>
                                <li>活動主辦方或其他使用者的行為或疏漏</li>
                                <li>服務中斷、延遲或錯誤</li>
                                <li>對使用者帳戶或資料的未經授權存取</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 - User Responsibility */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <UserX className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">4. User Responsibility</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Users are responsible for:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Verifying event information independently before registration or attendance</li>
                                <li>Assessing the safety and suitability of events for themselves</li>
                                <li>Complying with event rules and local laws</li>
                                <li>Protecting their own personal safety during events</li>
                                <li>Resolving disputes directly with event hosts</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">4. 使用者責任</h3>
                        <div className="space-y-4 text-gray-500">
                            <p>使用者須負責：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li>在報名或參加前獨立驗證活動資訊</li>
                                <li>自行評估活動的安全性和適合性</li>
                                <li>遵守活動規則及當地法律</li>
                                <li>在活動期間保護自身人身安全</li>
                                <li>直接與活動主辦方解決爭議</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5 - Service Availability */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Server className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">5. Service Availability</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind</li>
                                <li>We do not guarantee uninterrupted, secure, or error-free operation</li>
                                <li>We reserve the right to modify, suspend, or discontinue services at any time</li>
                                <li>Scheduled maintenance may cause temporary service interruptions</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">5. 服務可用性</h3>
                        <div className="space-y-4 text-gray-500">
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li>服務以「現況」和「可用」的方式提供，不附帶任何形式的保證</li>
                                <li>我們不保證不中斷、安全或無錯誤的運作</li>
                                <li>我們保留隨時修改、暫停或終止服務的權利</li>
                                <li>定期維護可能造成暫時性的服務中斷</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 6 - Indemnification */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">6. Indemnification</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                You agree to indemnify, defend, and hold harmless Party Taiwan, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, violation of these terms, or infringement of any third-party rights.
                            </p>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">6. 賠償</h3>
                        <div className="space-y-4 text-gray-500">
                            <p>
                                您同意賠償、辯護並使 Party、其主管、董事、員工及代理人免受因您使用本平台、違反本條款或侵害任何第三方權利而產生的任何索賠、損害、損失或費用（包括法律費用）的損害。
                            </p>
                        </div>
                    </section>

                    {/* Governing Law */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">7. Governing Law | 準據法</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                This Disclaimer shall be governed by and construed in accordance with the laws of the Republic of China (Taiwan). Any disputes shall be submitted to the exclusive jurisdiction of the Taipei District Court.
                            </p>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <div className="space-y-4 text-gray-500">
                            <p>
                                本免責聲明受中華民國法律管轄並據其解釋。任何爭議應提交台灣台北地方法院專屬管轄。
                            </p>
                        </div>
                    </section>

                    {/* Related Links */}
                    <section className="pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold mb-4">Related Documents | 相關文件</h2>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/terms" className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors">
                                Terms of Service | 服務條款
                            </Link>
                            <Link href="/privacy" className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors">
                                Privacy Policy | 隱私權政策
                            </Link>
                            <Link href="/payment-terms" className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors">
                                Payment Terms | 金流服務聲明
                            </Link>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="pt-8 mt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold mb-4">Contact Us | 聯絡我們</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>For questions about this Disclaimer:</p>
                            <p><strong>Email:</strong> <a href="mailto:support@party.com.tw" className="text-gray-900 hover:underline">support@party.com.tw</a></p>
                            <p><strong>Location:</strong> Taipei, Taiwan</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
