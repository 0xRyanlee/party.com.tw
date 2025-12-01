'use client';

import { useState } from 'react';
import { Briefcase, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationModal from '@/components/ApplicationModal';
import { EventRole, EventResource } from '@/types/schema';

interface CollaborationOpportunitiesProps {
    event: {
        id: string;
        title: string;
    };
    roles: EventRole[];
    resources: EventResource[];
    loading?: boolean; // Optional loading state
}

export default function CollaborationOpportunities({
    event,
    roles,
    resources,
}: CollaborationOpportunitiesProps) {
    const [applicationModal, setApplicationModal] = useState<{
        isOpen: boolean;
        target: {
            type: 'role' | 'resource';
            id: string;
            data: EventRole | EventResource;
        } | null;
    }>({ isOpen: false, target: null });

    const openApplicationModal = (type: 'role' | 'resource', id: string, data: EventRole | EventResource) => {
        setApplicationModal({
            isOpen: true,
            target: { type, id, data },
        });
    };

    const closeApplicationModal = () => {
        setApplicationModal({ isOpen: false, target: null });
    };

    const openRoles = roles.filter((r) => r.status === 'open');
    const openResources = resources.filter((r) => r.status === 'open');

    if (openRoles.length === 0 && openResources.length === 0) {
        return null;
    }

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">🤝 合作機會</h2>
                    <p className="text-gray-600">
                        此活動正在尋找專業工作者和資源提供者
                    </p>
                </div>

                {/* Vendor Roles */}
                {openRoles.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            徵求專業工作者
                        </h3>
                        <div className="grid gap-4">
                            {openRoles.map((role) => (
                                <div
                                    key={role.id}
                                    className="bg-white border border-gray-200 rounded-[20px] p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold text-lg">
                                                    {role.roleType}
                                                </h4>
                                                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                    需 {role.countNeeded} 人
                                                </span>
                                            </div>

                                            {role.description && (
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {role.description}
                                                </p>
                                            )}

                                            {(role.budgetMin || role.budgetMax) && (
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span className="font-medium">
                                                        預算: ${role.budgetMin || 0} - ${role.budgetMax || 0}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            onClick={() => openApplicationModal('role', role.id, role)}
                                            className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
                                        >
                                            申請
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Supplier Resources */}
                {openResources.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            徵求資源提供
                        </h3>
                        <div className="grid gap-4">
                            {openResources.map((resource) => (
                                <div
                                    key={resource.id}
                                    className="bg-white border border-gray-200 rounded-[20px] p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold text-lg">
                                                    {resource.resourceType}
                                                </h4>
                                            </div>

                                            {resource.description && (
                                                <p className="text-sm text-gray-600">
                                                    {resource.description}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            onClick={() =>
                                                openApplicationModal('resource', resource.id, resource)
                                            }
                                            className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
                                        >
                                            申請
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Application Modal */}
            {applicationModal.target && (
                <ApplicationModal
                    isOpen={applicationModal.isOpen}
                    onClose={closeApplicationModal}
                    event={event}
                    target={applicationModal.target}
                />
            )}
        </>
    );
}
