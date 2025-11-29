"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, X, Share2, Heart } from "lucide-react";
import { Event } from "@/lib/mock-data";

interface EventDetailModalProps {
    event: Event | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
    if (!event) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white text-black border-none rounded-[32px]">

                {/* Hero Image Header */}
                <div className="relative h-64 w-full">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${event.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
                        onClick={onClose}
                    >
                        <X className="w-6 h-6" />
                    </Button>

                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex gap-2 mb-3">
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">
                                {event.type}
                            </Badge>
                            {event.isPromoted && (
                                <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none">
                                    Featured
                                </Badge>
                            )}
                        </div>
                        <DialogTitle className="text-3xl font-bold mb-2">{event.title}</DialogTitle>
                        <div className="flex items-center gap-2 text-gray-200 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-6 md:p-8 space-y-8 max-h-[60vh] overflow-y-auto">

                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-2xl">
                            <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</div>
                            <div className="font-bold text-sm">{event.date}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl">
                            <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</div>
                            <div className="font-bold text-sm">{event.time}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl">
                            <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Guests</div>
                            <div className="font-bold text-sm">{event.attendees} / {event.capacity}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl">
                            <div className="text-gray-400 text-xs mb-1">Price</div>
                            <div className="font-bold text-sm text-emerald-600">{event.price}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-bold mb-3">About Event</h3>
                        <DialogDescription className="text-gray-600 leading-relaxed text-base">
                            {event.description}
                        </DialogDescription>
                    </div>

                    {/* Organizer */}
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 bg-gray-200 rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${event.organizer.avatar})` }}
                            />
                            <div>
                                <div className="text-xs text-gray-400">Hosted by</div>
                                <div className="font-bold text-sm flex items-center gap-1">
                                    {event.organizer.name}
                                    {event.organizer.verified && (
                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full text-xs h-8">
                            Follow
                        </Button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-white flex gap-4 sticky bottom-0 z-10">
                    <Button variant="outline" size="icon" className="rounded-full w-12 h-12 shrink-0">
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full w-12 h-12 shrink-0">
                        <Heart className="w-5 h-5" />
                    </Button>
                    <Button className="flex-1 rounded-full bg-black hover:bg-gray-800 text-white h-12 text-lg font-medium">
                        Join Event
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
