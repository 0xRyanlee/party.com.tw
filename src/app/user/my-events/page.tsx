import { getUserRegistrations } from "@/app/actions/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MyEventsPage() {
    const registrations = await getUserRegistrations();

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <h1 className="text-3xl font-bold mb-6">My Upcoming Events</h1>

            {registrations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                    <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
                    <Link href="/events">
                        <Button className="rounded-full bg-black text-white">
                            Browse Events
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {registrations.map((reg: any) => (
                        <Card key={reg.id} className="overflow-hidden rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div
                                className="h-48 w-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${reg.event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'})` }}
                            />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold">{reg.event.title}</CardTitle>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${reg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {reg.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{reg.event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{reg.event.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{reg.event.location_name}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
