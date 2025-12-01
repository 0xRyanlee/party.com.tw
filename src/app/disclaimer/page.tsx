import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DisclaimerPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">免責聲明 (Disclaimer)</h1>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>1. 資料來源與著作權聲明</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 leading-relaxed space-y-4">
                        <p>
                            本平台（Party）致力於聚合台灣各地的公開活動資訊，旨在方便用戶發現與參與活動。
                            平台上的活動資訊（包括但不限於標題、時間、地點、摘要）均來自於公開的網際網路資源、主辦方官方網站、社交媒體公開頁面或由第三方合作夥伴提供。
                        </p>
                        <p>
                            本平台尊重智慧財產權。所有原始活動內容的著作權歸屬於原主辦方或原發布平台所有。
                            本平台僅進行資訊的彙整、索引與導流，並不宣稱擁有這些內容的著作權。
                            若您是內容權利人，且認為本平台的內容侵犯了您的權益，請立即與我們聯繫，我們將在確認後儘速移除相關內容。
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. 資訊準確性與責任限制</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 leading-relaxed space-y-4">
                        <p>
                            本平台盡力確保所提供資訊的準確性與即時性，但無法保證所有資訊（如活動時間變更、取消、票價調整等）均為最新或完全無誤。
                            用戶在前往參加活動或進行購票前，強烈建議點擊「官方連結」前往主辦方官方頁面進行最終確認。
                        </p>
                        <p>
                            對於因使用本平台資訊而產生的任何直接、間接、附帶或衍生的損失（包括但不限於交通費損失、時間損失、報名費損失），本平台不承擔任何法律責任。
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>3. 個人資料保護與隱私</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 leading-relaxed space-y-4">
                        <p>
                            本平台在蒐集公開活動資訊時，嚴格遵守《個人資料保護法》。我們僅蒐集公開的活動相關資訊（如演出者名稱、主辦單位聯絡方式），絕不惡意蒐集、處理或利用非公開的個人隱私資料。
                        </p>
                        <p>
                            若公開資訊中包含個人資料（如聯絡人手機），本平台將視為該資料已由當事人自行公開或合法公開，並僅用於活動聯繫之特定目的。
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>4. 外部連結</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 leading-relaxed space-y-4">
                        <p>
                            本平台包含指向第三方網站的連結。這些網站的內容與隱私政策不受本平台控制。
                            點擊這些連結即表示您將離開本平台，我們對第三方網站的內容或安全性不負任何責任。
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
