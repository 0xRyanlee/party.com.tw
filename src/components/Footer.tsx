import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Party</h3>
                        <p className="text-gray-500 text-sm">
                            Discover the best events in Taiwan. <br />
                            Connect, celebrate, and create memories.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/events" className="hover:text-black">Browse Events</Link></li>
                            <li><Link href="/map" className="hover:text-black">Map View</Link></li>
                            <li><Link href="/host" className="hover:text-black">For Hosts</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/help" className="hover:text-black">Help Center</Link></li>
                            <li><Link href="/contact" className="hover:text-black">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/disclaimer" className="hover:text-black">Disclaimer (免責聲明)</Link></li>
                            <li><Link href="/privacy" className="hover:text-black">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-black">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Party Aggregator. All rights reserved.</p>
                    <p>Data sources are property of their respective owners.</p>
                </div>
            </div>
        </footer>
    );
}
