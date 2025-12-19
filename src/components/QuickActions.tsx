import Link from "next/link";
import { Plus, User, Users } from "lucide-react";

export default function QuickActions() {
    return (
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-[32px] p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-white">快速操作</h3>
            <div className="space-y-3">
                <Link href="/host/edit" className="block group">
                    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-800/60 transition-all active:scale-95">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 transition-colors">
                            <Plus className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-white">辦個自己的活動</div>
                            <div className="text-xs text-zinc-400">成為主辦方，發起聚會</div>
                        </div>
                    </div>
                </Link>

                <Link href="/settings" className="block group">
                    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-800/60 transition-all active:scale-95">
                        <div className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-600 transition-colors">
                            <User className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-white">成為貢獻者</div>
                            <div className="text-xs text-zinc-400">協助完善活動資訊</div>
                        </div>
                    </div>
                </Link>

                <Link href="/club" className="block group">
                    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-800/60 transition-all active:scale-95">
                        <div className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-600 transition-colors">
                            <Users className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-white">成為社群領袖</div>
                            <div className="text-xs text-zinc-400">建立專屬俱樂部</div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
