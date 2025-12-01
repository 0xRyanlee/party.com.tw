export type UserRole = 'member' | 'host' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export type MemberLevel = 'free' | 'plus' | 'pro' | 'ultra';

export interface Member extends User {
    level: MemberLevel;
    points: number;
    joinedClubs: string[]; // Club IDs
    attendedEvents: string[]; // Event IDs
}

export interface Club {
    id: string;
    name: string;
    description: string;
    coverImage?: string;
    ownerId: string;
    members: string[]; // User IDs
    createdAt: string;
    updatedAt: string;
}

export type EventType =
    | 'party' | 'meetup' | 'workshop' | 'gathering'
    | 'lecture' | 'conference' | 'event' | 'rave'
    | 'potluck' | 'popup' | 'exhibition' | 'performance'
    | 'hackathon' | 'networking' | 'retreat' | 'coholding'
    | 'meeting' | 'sport' | 'expo' | 'festival'
    | 'marathon' | 'training_camp' | 'language_exchange'
    | 'flea_market' | 'farmers_market';

export interface Event {
    id: string;
    title: string;
    description: string;
    type: EventType;
    date: string;
    time: string;
    locationName: string;
    address: string;
    latitude?: number;
    longitude?: number;
    image?: string;
    organizerId: string; // User ID
    clubId?: string; // Optional Club ID
    isPublic: boolean;
    price: number; // 0 for free
    currency: string;
    capacity?: number;
    registeredCount: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export type RoleStatus = 'open' | 'closed';
export type ResourceStatus = 'open' | 'closed';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface EventRole {
    id: string;
    eventId: string;
    roleType: string;
    countNeeded: number;
    budgetMin?: number;
    budgetMax?: number;
    description?: string;
    status: RoleStatus;
    createdAt: string;
}

export interface EventResource {
    id: string;
    eventId: string;
    resourceType: string;
    description?: string;
    status: ResourceStatus;
    createdAt: string;
}

export interface Application {
    id: string;
    eventId: string;
    userId: string;
    targetRoleId?: string;
    targetResourceId?: string;
    message?: string;
    contactInfo?: string;
    status: ApplicationStatus;
    createdAt: string;
}
