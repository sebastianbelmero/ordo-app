import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormEventHandler, useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
}

interface AddFriendProps {
    users: User[];
    search: string;
}

// =============================================================================
// COMPONENTS
// =============================================================================

function UserAvatar({ user }: { user: User }) {
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
            ) : (
                user.name.substring(0, 2).toUpperCase()
            )}
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AddFriend({ users, search }: AddFriendProps) {
    const [searchQuery, setSearchQuery] = useState(search);
    const [sendingTo, setSendingTo] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Friends', href: '/friends' },
        { title: 'Add Friend', href: '/friends/add' },
    ];

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get('/friends/add', { search: searchQuery }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSendRequest = (userId: number) => {
        setSendingTo(userId);
        router.post('/friends', { receiver_id: userId }, {
            preserveScroll: true,
            onFinish: () => setSendingTo(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Friend" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/friends">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Add Friend</h1>
                        <p className="text-muted-foreground">Search for users to add as friends</p>
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                {/* Results */}
                <div className="rounded-xl border bg-card p-4">
                    {!search ? (
                        <div className="py-8 text-center">
                            <Search className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">Enter a name or email to search</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">No users found for "{search}"</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar user={user} />
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        disabled={sendingTo === user.id}
                                        onClick={() => handleSendRequest(user.id)}
                                    >
                                        <UserPlus className="mr-1 h-4 w-4" />
                                        {sendingTo === user.id ? 'Sending...' : 'Add Friend'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
