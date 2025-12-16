import { FileText, AlertTriangle, Scale, Users, Ban, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | 服務條款 - Party Taiwan',
    description: 'Read Party Taiwan Terms of Service. 閱讀 Party 平台服務條款。',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">Terms of Service</h1>
                        <p className="text-2xl opacity-80 mb-4">服務條款</p>
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
                            Welcome to Party Taiwan (&quot;the Platform&quot;). By using our services, you agree to be bound by these Terms of Service. Please read them carefully before using the platform.
                        </p>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            歡迎使用 Party 平台。使用本平台即表示您同意遵守以下服務條款。請仔細閱讀本條款，如不同意請勿使用本平台。
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">1. Services Description | 服務說明</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Party Taiwan provides the following services:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Event discovery and search</li>
                                <li>Event registration and management</li>
                                <li>Event creation and promotion tools for hosts</li>
                                <li>Community features and participant interaction</li>
                            </ul>
                            <p className="mt-4 text-sm text-gray-500">
                                We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-100 text-gray-500 text-sm">
                                <p>本平台提供活動資訊瀏覽、報名管理、活動發起推廣、社群互動等服務。本平台保留隨時修改或終止服務的權利。</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">2. User Responsibilities | 用戶責任</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>When using our platform, you agree to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide accurate and truthful personal information</li>
                                <li>Keep your account credentials secure and confidential</li>
                                <li>Be responsible for all activities under your account</li>
                                <li>Comply with all applicable laws and regulations</li>
                                <li>Respect the rights and privacy of other users</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">3. Event Host Guidelines | 活動主辦規範</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>When creating events, hosts must:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide accurate and complete event information</li>
                                <li>Ensure event content is legal and appropriate</li>
                                <li>Fulfill commitments made to participants</li>
                                <li>Update event changes in a timely manner</li>
                                <li>Handle registrations and refunds properly</li>
                            </ul>
                            <p className="mt-4 text-sm text-gray-500">
                                We reserve the right to review, modify, or remove any event that violates our guidelines.
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Ban className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">4. Prohibited Conduct | 禁止行為</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>The following activities are strictly prohibited:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Posting false or misleading information</li>
                                <li>Harassing, threatening, or insulting other users</li>
                                <li>Infringing on intellectual property rights</li>
                                <li>Distributing malware, viruses, or spam</li>
                                <li>Attempting to compromise platform security</li>
                                <li>Unauthorized access to accounts or data</li>
                                <li>Engaging in fraud, money laundering, or illegal activities</li>
                            </ul>
                            <p className="mt-4 font-medium text-red-600">
                                Violators will have their accounts suspended or terminated and may face legal action.
                            </p>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">5. Intellectual Property | 智慧財產權</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                All platform content (including but not limited to text, images, logos, and code) is protected by intellectual property laws. Unauthorized reproduction, modification, or commercial use is prohibited.
                            </p>
                            <p className="mt-4">
                                Content you upload (such as event information and images) remains yours, but you grant us a license to use, display, and promote it on the platform.
                            </p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">6. Disclaimer | 免責聲明</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Party Taiwan:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Does not guarantee uninterrupted or error-free service</li>
                                <li>Is not responsible for the actions of event hosts</li>
                                <li>Is not liable for disputes or transactions between users</li>
                                <li>Does not guarantee the accuracy of event information</li>
                            </ul>
                            <p className="mt-4">
                                Use of this platform is at your own risk. To the extent permitted by law, we disclaim all liability for direct, indirect, incidental, or consequential damages.
                            </p>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">7. Refund Policy | 退款政策</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                Refund policies are determined by individual event hosts. Party Taiwan only provides platform services and does not intervene in refund processes. For refund disputes, please contact the event host directly.
                            </p>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">8. Privacy | 隱私權</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                We value your privacy. Please refer to our{' '}
                                <Link href="/privacy" className="text-gray-900 hover:underline font-medium">
                                    Privacy Policy
                                </Link>
                                {' '}to understand how we collect, use, and protect your personal data.
                            </p>
                        </div>
                    </section>

                    {/* Section 9 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">9. Changes to Terms | 條款變更</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                We reserve the right to modify these Terms of Service at any time. For significant changes, we will notify you via email or platform notification. Continued use of the platform after changes constitutes acceptance of the updated terms.
                            </p>
                        </div>
                    </section>

                    {/* Section 10 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">10. Governing Law | 準據法與管轄</h2>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                These Terms of Service are governed by the laws of the Republic of China (Taiwan). Any disputes arising from these terms shall be submitted to the Taipei District Court as the court of first instance.
                            </p>
                            <p className="mt-4 text-gray-500 text-sm">
                                本服務條款受中華民國法律管轄。因本條款產生的任何爭議，雙方同意以台灣台北地方法院為第一審管轄法院。
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold mb-4">Contact Us | 聯絡我們</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>For questions about these Terms of Service:</p>
                            <p><strong>Email:</strong> <a href="mailto:support@party.com.tw" className="text-gray-900 hover:underline">support@party.com.tw</a></p>
                            <p><strong>Location:</strong> Taipei, Taiwan</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
