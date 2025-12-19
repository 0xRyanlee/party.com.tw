import { CreditCard, Shield, AlertTriangle, Scale, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Payment Terms | 金流服務聲明 - Party Taiwan',
    description: 'Payment services terms and conditions for Party Taiwan. Party 平台金流服務條款與聲明。',
};

export default function PaymentTermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <CreditCard className="w-16 h-16 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">Payment Terms</h1>
                        <p className="text-2xl opacity-80 mb-4">金流服務聲明</p>
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
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Overview
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Party Taiwan (&quot;the Platform&quot;) provides event ticketing and registration services. This Payment Terms document outlines the terms and conditions governing payment transactions conducted through our platform. By using our payment services, you agree to these terms.
                        </p>
                    </section>

                    {/* Introduction - Chinese */}
                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-600 mb-4">概述</h2>
                        <p className="text-gray-500 leading-relaxed">
                            Party 平台（以下簡稱「本平台」）提供活動票券與報名服務。本金流服務聲明規範透過本平台進行的支付交易條款與條件。使用本平台的支付服務即表示您同意以下條款。
                        </p>
                    </section>

                    {/* Section 1 - Payment Processing */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">1. Payment Processing</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Party Taiwan partners with licensed third-party payment processors to handle all transactions. We do not directly store your credit card information.</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Payment Methods:</strong> Credit cards (Visa, Mastercard, JCB), debit cards, and other electronic payment methods as available.</li>
                                <li><strong>Currency:</strong> All transactions are processed in New Taiwan Dollars (TWD) unless otherwise specified.</li>
                                <li><strong>Security:</strong> All payment transactions are encrypted using industry-standard SSL/TLS protocols.</li>
                                <li><strong>Processing Time:</strong> Payments are typically processed instantly. However, bank processing times may vary.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">1. 支付處理</h3>
                        <div className="space-y-4 text-gray-500">
                            <p>Party 與合法的第三方支付處理商合作處理所有交易。我們不會直接儲存您的信用卡資訊。</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li><strong>支付方式：</strong>信用卡（Visa、Mastercard、JCB）、金融卡及其他可用的電子支付方式。</li>
                                <li><strong>幣別：</strong>除另有說明外，所有交易均以新台幣（TWD）計價處理。</li>
                                <li><strong>安全性：</strong>所有支付交易均使用業界標準 SSL/TLS 協議加密。</li>
                                <li><strong>處理時間：</strong>支付通常即時處理，但銀行處理時間可能有所不同。</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 2 - Platform Role */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">2. Platform Role & Limitations</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Party Taiwan acts solely as an intermediary platform connecting event hosts with participants. Important clarifications:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Ticket Sales:</strong> Tickets are sold by individual event hosts, not by Party Taiwan.</li>
                                <li><strong>Event Responsibility:</strong> Event hosts are solely responsible for the execution, quality, and fulfillment of their events.</li>
                                <li><strong>No Guarantee:</strong> We do not guarantee the quality, safety, or occurrence of any event listed on our platform.</li>
                                <li><strong>Transaction Disputes:</strong> For disputes regarding event content or quality, buyers should contact the event host directly.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">2. 平台角色與限制</h3>
                        <div className="space-y-4 text-gray-500">
                            <p>Party 僅作為連結活動主辦方與參與者的中介平台。重要說明：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li><strong>票券銷售：</strong>票券由個別活動主辦方銷售，非由 Party 銷售。</li>
                                <li><strong>活動責任：</strong>活動主辦方須對其活動的執行、品質及履行負完全責任。</li>
                                <li><strong>無擔保：</strong>我們不擔保本平台上任何活動的品質、安全或舉行與否。</li>
                                <li><strong>交易爭議：</strong>關於活動內容或品質的爭議，買方應直接聯繫活動主辦方。</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 - Refund Policy */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">3. Refund Policy</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Refund policies are determined by individual event hosts. General guidelines:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Host-Defined Policy:</strong> Each event may have different refund terms set by the host.</li>
                                <li><strong>Cancellation by Host:</strong> If an event is cancelled by the host, buyers are typically entitled to a full refund.</li>
                                <li><strong>No-Show:</strong> Failure to attend an event does not entitle the buyer to a refund unless specified by the host.</li>
                                <li><strong>Processing Fee:</strong> Refunds may be subject to transaction processing fees as specified in the event terms.</li>
                                <li><strong>Timeline:</strong> Refunds are typically processed within 7-14 business days, depending on the payment provider.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">3. 退款政策</h3>
                        <div className="space-y-4 text-gray-500">
                            <p>退款政策由個別活動主辦方決定。一般準則如下：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li><strong>主辦方自訂政策：</strong>每場活動可能有主辦方設定的不同退款條款。</li>
                                <li><strong>主辦方取消活動：</strong>若活動由主辦方取消，買方通常有權獲得全額退款。</li>
                                <li><strong>未出席：</strong>未參加活動不代表買方有權獲得退款，除非主辦方另有規定。</li>
                                <li><strong>手續費：</strong>退款可能需扣除活動條款中載明的交易手續費。</li>
                                <li><strong>作業時間：</strong>退款通常於 7-14 個工作天內處理，視支付服務商而定。</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 - Disclaimer */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">4. Liability Disclaimer</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <p>Party Taiwan expressly disclaims liability for:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>The accuracy or reliability of event information provided by hosts</li>
                                <li>The fulfillment of event commitments by hosts</li>
                                <li>Any disputes between buyers and event hosts</li>
                                <li>Payment processing delays caused by third-party providers</li>
                                <li>Any losses incurred due to event cancellation, postponement, or modification by hosts</li>
                            </ul>
                            <p className="mt-4 font-medium text-red-600">
                                To the maximum extent permitted by law, our liability is limited to the transaction fees collected by Party Taiwan.
                            </p>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">4. 責任免除</h3>
                        <div className="space-y-4 text-gray-500">
                            <p>Party 明確免除以下責任：</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li>主辦方提供的活動資訊之準確性或可靠性</li>
                                <li>主辦方對活動承諾之履行</li>
                                <li>買方與活動主辦方之間的任何爭議</li>
                                <li>第三方服務商造成的支付處理延遲</li>
                                <li>因主辦方取消、延期或修改活動而造成的任何損失</li>
                            </ul>
                            <p className="mt-4 font-medium text-red-500">
                                在法律允許的最大範圍內，我們的責任僅限於 Party 收取的交易手續費。
                            </p>
                        </div>
                    </section>

                    {/* Section 5 - Security */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-gray-600" />
                            <h2 className="text-2xl font-bold">5. Payment Security</h2>
                        </div>
                        <div className="space-y-4 text-gray-700">
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>All payment data is processed by PCI-DSS compliant payment processors</li>
                                <li>We do not store full credit card numbers on our servers</li>
                                <li>Suspicious transactions may be flagged for additional verification</li>
                                <li>Users are responsible for maintaining the security of their accounts</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-12 pb-8 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-600 mb-4">5. 支付安全</h3>
                        <div className="space-y-4 text-gray-500">
                            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                <li>所有支付資料均由符合 PCI-DSS 規範的支付處理商處理</li>
                                <li>我們不會在伺服器上儲存完整的信用卡號碼</li>
                                <li>可疑交易可能會被標記進行額外驗證</li>
                                <li>使用者須負責維護其帳戶的安全</li>
                            </ul>
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
                            <Link href="/disclaimer" className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors">
                                Disclaimer | 免責聲明
                            </Link>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="pt-8 mt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold mb-4">Contact Us | 聯絡我們</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>For payment-related inquiries:</p>
                            <p><strong>Email:</strong> <a href="mailto:support@party.com.tw" className="text-gray-900 hover:underline">support@party.com.tw</a></p>
                            <p><strong>Location:</strong> Taipei, Taiwan</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
