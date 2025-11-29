"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, UserCog, Shield, Users, Search, MoreHorizontal, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ClubManagePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("settings");

    // Mock Data
    const [club, setClub] = useState({
        name: "Taipei Tech Meetup",
        description: "A community for tech enthusiasts in Taipei to share knowledge and network.",
        type: "Public",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2940&auto=format&fit=crop",
        isPrivate: false,
    });

    const [members, setMembers] = useState([
        { id: 1, name: "Alice Chen", nickname: "Alice", role: "Admin", avatar: "https://github.com/shadcn.png" },
        { id: 2, name: "Bob Wang", nickname: "Bob", role: "Moderator", avatar: "" },
        { id: 3, name: "Charlie Lin", nickname: "C-Dawg", role: "Member", avatar: "" },
        { id: 4, name: "David Wu", nickname: "Dave", role: "Member", avatar: "" },
        { id: 5, name: "Eva Zhang", nickname: "Eva", role: "Member", avatar: "" },
    ]);

    const [permissions, setPermissions] = useState([
        { id: "create_event", label: "Create Events", admin: true, mod: true, member: false },
        { id: "approve_member", label: "Approve New Members", admin: true, mod: true, member: false },
        { id: "post_announcement", label: "Post Announcements", admin: true, mod: false, member: false },
        { id: "manage_roles", label: "Manage Roles", admin: true, mod: false, member: false },
    ]);

    return (
        <main className="min-h-screen bg-gray-50 text-black pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-bold">Manage Club</h1>
                </div>
                <Button className="rounded-full bg-black text-white hover:bg-gray-800">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-full h-12">
                        <TabsTrigger value="settings" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Settings</TabsTrigger>
                        <TabsTrigger value="members" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Members</TabsTrigger>
                        <TabsTrigger value="permissions" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Permissions</TabsTrigger>
                    </TabsList>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>General Information</CardTitle>
                                <CardDescription>Update your club's public profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Club Name</Label>
                                    <Input
                                        id="name"
                                        value={club.name}
                                        onChange={(e) => setClub({ ...club, name: e.target.value })}
                                        className="bg-gray-50 border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea
                                        id="desc"
                                        value={club.description}
                                        onChange={(e) => setClub({ ...club, description: e.target.value })}
                                        className="bg-gray-50 border-gray-200 min-h-[100px]"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Private Club</Label>
                                        <p className="text-sm text-gray-500">Only approved members can see content.</p>
                                    </div>
                                    <Switch
                                        checked={club.isPrivate}
                                        onCheckedChange={(checked) => setClub({ ...club, isPrivate: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Members Tab */}
                    <TabsContent value="members" className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input placeholder="Search members..." className="pl-10 bg-white border-gray-200 rounded-full" />
                            </div>
                            <Button variant="outline" className="rounded-full">
                                <UserCog className="w-4 h-4 mr-2" />
                                Invite
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {members.map((member) => (
                                <motion.div
                                    key={member.id}
                                    layout
                                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{member.name}</h3>
                                                <Badge variant="secondary" className="text-[10px] h-5">
                                                    {member.role}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                                                <span>aka</span>
                                                <span className="font-medium text-gray-700">{member.nickname}</span>
                                                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 text-gray-400 hover:text-black">
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Permissions Tab */}
                    <TabsContent value="permissions" className="space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Role Permissions</CardTitle>
                                <CardDescription>Control what each role can do in the club.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Header Row */}
                                    <div className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-100 font-medium text-sm text-gray-500">
                                        <div className="col-span-1">Permission</div>
                                        <div className="text-center">Admin</div>
                                        <div className="text-center">Moderator</div>
                                        <div className="text-center">Member</div>
                                    </div>

                                    {/* Permission Rows */}
                                    {permissions.map((perm) => (
                                        <div key={perm.id} className="grid grid-cols-4 gap-4 items-center">
                                            <div className="col-span-1 font-medium text-sm">{perm.label}</div>
                                            <div className="flex justify-center">
                                                <Switch checked={perm.admin} disabled />
                                            </div>
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={perm.mod}
                                                    onCheckedChange={(checked) => {
                                                        setPermissions(permissions.map(p =>
                                                            p.id === perm.id ? { ...p, mod: checked } : p
                                                        ));
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={perm.member}
                                                    onCheckedChange={(checked) => {
                                                        setPermissions(permissions.map(p =>
                                                            p.id === perm.id ? { ...p, member: checked } : p
                                                        ));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
