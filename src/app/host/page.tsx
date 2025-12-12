import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Calendar, TrendingUp } from 'lucide-react';

export default function ForHostsPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        為主辦方打造
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
                        輕鬆發起活動<br />連結更多人
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        無論是小型聚會、工作坊還是大型派對，Party 提供您所需的所有工具，讓活動管理變得簡單高效。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/events/host/edit">
                            <Button size="lg" className="rounded-full bg-gray-900 hover:bg-gray-800 text-white px-8">
                                開始發起活動
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/help">
                            <Button size="lg" variant="outline" className="rounded-full">
                                查看使用教學
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">為什麼選擇 Party？</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Calendar className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">快速創建</h3>
                            <p className="text-gray-600">
                                只需幾分鐘即可創建活動，直觀的介面讓您輕鬆填寫活動資訊、設定票務和管理參與者。
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">報名管理</h3>
                            <p className="text-gray-600">
                                即時查看報名狀況、管理候補名單、發送通知，所有參與者資訊一目了然。
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">數據分析</h3>
                            <p className="text-gray-600">
                                深入了解活動表現，追蹤報名趨勢、參與率和來源渠道，持續優化您的活動。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="container mx-auto px-4 py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">如何開始？</h2>
                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">創建帳號並登入</h3>
                                <p className="text-gray-600">
                                    使用 Google、Email 或 Line 快速註冊，無需繁瑣流程。
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">填寫活動資訊</h3>
                                <p className="text-gray-600">
                                    輸入活動標題、描述、時間地點，上傳封面圖片，設定票務和參與者限制。
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">發布並分享</h3>
                                <p className="text-gray-600">
                                    一鍵發布活動，使用內建的分享工具推廣到社交媒體，吸引更多參與者。
                                </p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                                4
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">管理與追蹤</h3>
                                <p className="text-gray-600">
                                    在活動管理儀表板查看報名、簽到、數據分析，輕鬆掌握活動進度。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center bg-gray-900 rounded-xl p-12 text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        準備好發起您的第一個活動了嗎？
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        加入數千位主辦方，開始連結更多志同道合的人。
                    </p>
                    <Link href="/events/host/edit">
                        <Button size="lg" className="rounded-full bg-white text-gray-900 hover:bg-gray-100 px-8">
                            免費開始
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

