import { Logo } from "@/components/ui/logo";
import { SocialButton } from "@/components/ui/social-button";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative">
            {/* Logo Section */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs">
                <div className="mb-12">
                    <Logo className="scale-150" />
                </div>
            </div>

            {/* Actions Section */}
            <div className="w-full max-w-xs space-y-4 mb-12">
                <SocialButton
                    provider="line"
                    icon={
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M20.7 12c0-4.8-4.6-8.7-10.3-8.7S.1 7.2.1 12c0 4.3 3.8 7.9 8.6 8.6.3 0 .8.1.9-.2.1-.2 0-.5 0-.9 0-.3-.1-1.2-.1-1.2s-.1-.5.3-.5c.3 0 2.4 1.4 2.9 1.7 1.6 1 4.3 1.1 5.6.3 1.5-.8 2.4-3.3 2.4-7.8z" />
                        </svg>
                    }
                >
                    Line登入
                </SocialButton>

                <SocialButton
                    provider="apple"
                    icon={
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M17.5 12.6c-.1 2.5 2.2 3.4 2.3 3.4-.1.1-.3.9-1 2-.7 1-1.4 2-2.5 2.1-1.1 0-1.5-.6-2.8-.6-1.4 0-1.8.6-2.8.6-1.1-.1-1.9-1.1-2.6-2.1-1.4-2-2.5-5.7-1-8.2 1.5-2.5 4.1-2.6 5.5-2.6 1.1 0 2.1.7 2.8.7.7 0 1.9-.9 3.2-.8 1.5.1 2.8.8 3.5 1.9-3 1.4-2.5 5.6-1.6 7.6zM14.9 5.6c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3z" />
                        </svg>
                    }
                >
                    Apple登入
                </SocialButton>

                <SocialButton
                    provider="google"
                    icon={
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                        </svg>
                    }
                >
                    Google登入
                </SocialButton>
            </div>

            {/* Footer */}
            <div className="text-center space-y-4 text-xs text-gray-500 pb-8">
                <p>
                    登入並使用本服務，即表示同意
                    <br />
                    <Link href="#" className="underline hover:text-gray-400">使用條款</Link>
                    與
                    <Link href="#" className="underline hover:text-gray-400">隱私權政策</Link>
                </p>
                <div className="flex items-center justify-center gap-2">
                    <Link href="#" className="hover:text-gray-400">我無法登入</Link>
                    <span>·</span>
                    <Link href="#" className="hover:text-gray-400">App Language</Link>
                </div>
            </div>
        </div>
    );
}
