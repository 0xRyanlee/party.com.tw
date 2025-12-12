import { redirect } from 'next/navigation';

export default function EventsHostPage() {
    // Redirect to dashboard by default
    redirect('/events/host/dashboard');
}
