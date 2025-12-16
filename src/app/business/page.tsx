"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BusinessPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-white text-black pb-20">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">Business Cooperation</h1>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-black text-white rounded-3xl p-8 mb-12">
                    <h2 className="text-3xl font-bold mb-4">Partner with Us</h2>
                    <p className="text-gray-300 leading-relaxed mb-8">
                        Reach the most active and engaged audience in Taiwan's nightlife and event scene.
                        We offer tailored solutions for brands, venues, and organizers.
                    </p>
                    <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-8">
                        Contact Sales
                    </Button>
                </div>

                <h3 className="text-xl font-bold mb-6">Cooperation Process</h3>
                <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">

                    <div className="relative pl-12">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">1</div>
                        <h4 className="font-bold text-lg mb-2">提交諮詢</h4>
                        <p className="text-gray-500 text-sm">Fill out our partnership form or send us an email with your proposal.</p>
                    </div>

                    <div className="relative pl-12">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">2</div>
                        <h4 className="font-bold text-lg mb-2">Consultation</h4>
                        <p className="text-gray-500 text-sm">Our team will review your needs and schedule a call to discuss the best strategy.</p>
                    </div>

                    <div className="relative pl-12">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">3</div>
                        <h4 className="font-bold text-lg mb-2">Proposal & Agreement</h4>
                        <p className="text-gray-500 text-sm">We'll provide a detailed proposal. Once agreed, we sign the contract.</p>
                    </div>

                    <div className="relative pl-12">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">4</div>
                        <h4 className="font-bold text-lg mb-2">Launch & Optimize</h4>
                        <p className="text-gray-500 text-sm">Your campaign goes live! We monitor performance and optimize for best results.</p>
                    </div>

                </div>

                <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Direct Contact
                    </h4>
                    <p className="text-gray-500 text-sm mb-4">For urgent inquiries, please email us directly.</p>
                    <a href="mailto:business@party.com.tw" className="text-emerald-600 font-medium hover:underline">
                        business@party.com.tw
                    </a>
                </div>
            </div>
        </main>
    );
}
