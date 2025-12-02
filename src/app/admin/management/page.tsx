import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ManagementClient from './ManagementClient';

export default async function ManagementPage() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin-session');

    // If not authenticated, show login form (handled by client component)
    const isAuthenticated = session?.value === 'authenticated';

    return <ManagementClient isAuthenticated={isAuthenticated} />;
}
