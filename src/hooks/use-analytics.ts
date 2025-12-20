'use client';

/**
 * Unified Analytics Hook
 * Provides tracking interfaces for GA4 and Amplitude (when configured)
 * 
 * Usage:
 * const { trackEvent, trackPageView, identify } = useAnalytics();
 * trackEvent('button_clicked', { button_name: 'submit' });
 */

// Type definitions for global gtag
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
        amplitude?: any;
    }
}

export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
}

export interface UserProperties {
    userId?: string;
    email?: string;
    name?: string;
    role?: string;
    [key: string]: any;
}

// GA4 Event Tracking
const trackGA4Event = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, properties);
    }
};

// GA4 Page View
const trackGA4PageView = (url: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', {
            page_location: url,
            page_title: title,
        });
    }
};

// Amplitude Event Tracking (placeholder for when Amplitude is configured)
const trackAmplitudeEvent = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.amplitude) {
        window.amplitude.track(eventName, properties);
    }
};

// Amplitude User Identify
const identifyAmplitude = (userProperties: UserProperties) => {
    if (typeof window !== 'undefined' && window.amplitude && userProperties.userId) {
        window.amplitude.setUserId(userProperties.userId);
        if (Object.keys(userProperties).length > 1) {
            const identify = new window.amplitude.Identify();
            Object.entries(userProperties).forEach(([key, value]) => {
                if (key !== 'userId') {
                    identify.set(key, value);
                }
            });
            window.amplitude.identify(identify);
        }
    }
};

/**
 * Core analytics functions
 */
export const analytics = {
    /**
     * Track a custom event
     */
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
        trackGA4Event(eventName, properties);
        trackAmplitudeEvent(eventName, properties);
    },

    /**
     * Track a page view
     */
    trackPageView: (url: string, title?: string) => {
        trackGA4PageView(url, title);
    },

    /**
     * Identify a user (for Amplitude)
     */
    identify: (userProperties: UserProperties) => {
        identifyAmplitude(userProperties);
    },

    // Predefined event helpers
    events: {
        // Auth events
        signUp: (method: 'google' | 'email' | 'line') =>
            analytics.trackEvent('sign_up', { method }),

        login: (method: 'google' | 'email' | 'line') =>
            analytics.trackEvent('login', { method }),

        logout: () =>
            analytics.trackEvent('logout'),

        // Event discovery
        viewEvent: (eventId: string, eventTitle: string, source: string) =>
            analytics.trackEvent('view_event', { event_id: eventId, event_title: eventTitle, source }),

        searchEvents: (query: string, resultsCount: number) =>
            analytics.trackEvent('search_events', { query, results_count: resultsCount }),

        filterEvents: (filterType: string, filterValue: string) =>
            analytics.trackEvent('filter_events', { filter_type: filterType, filter_value: filterValue }),

        // Registration
        startRegistration: (eventId: string) =>
            analytics.trackEvent('begin_checkout', { event_id: eventId }),

        completeRegistration: (eventId: string, ticketType: string, price: number) =>
            analytics.trackEvent('purchase', { event_id: eventId, ticket_type: ticketType, value: price }),

        // Ticket actions
        viewTicket: (ticketId: string) =>
            analytics.trackEvent('view_ticket', { ticket_id: ticketId }),

        transferTicket: (ticketId: string, method: 'qr' | 'link' | 'email') =>
            analytics.trackEvent('transfer_ticket', { ticket_id: ticketId, method }),

        checkIn: (eventId: string, ticketId: string) =>
            analytics.trackEvent('check_in', { event_id: eventId, ticket_id: ticketId }),

        // Club actions
        joinClub: (clubId: string, clubName: string) =>
            analytics.trackEvent('join_group', { group_id: clubId, group_name: clubName }),

        leaveClub: (clubId: string) =>
            analytics.trackEvent('leave_group', { group_id: clubId }),

        createClub: (clubId: string) =>
            analytics.trackEvent('create_group', { group_id: clubId }),

        // Social actions
        follow: (userId: string) =>
            analytics.trackEvent('follow_user', { user_id: userId }),

        unfollow: (userId: string) =>
            analytics.trackEvent('unfollow_user', { user_id: userId }),

        share: (contentType: 'event' | 'club' | 'vendor', contentId: string) =>
            analytics.trackEvent('share', { content_type: contentType, content_id: contentId }),

        // Host actions
        createEvent: (eventId: string) =>
            analytics.trackEvent('create_event', { event_id: eventId }),

        publishEvent: (eventId: string) =>
            analytics.trackEvent('publish_event', { event_id: eventId }),

        // Chat
        sendMessage: (contextType: 'event' | 'club', contextId: string) =>
            analytics.trackEvent('send_message', { context_type: contextType, context_id: contextId }),
    },
};

/**
 * React hook for analytics
 */
export function useAnalytics() {
    return analytics;
}

export default useAnalytics;
