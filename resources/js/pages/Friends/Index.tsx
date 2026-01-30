import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { UserPlus, Users, Clock, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
}

interface PendingReceived {
    id: number;
    sender: User;
    created_at: string;
}

interface PendingSent {
    id: number;
    receiver: User;
    created_at: string;
}

interface FriendsIndexProps {
    friends: User[];
    pendingReceived: PendingReceived[];
    pendingSent: PendingSent[];
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

export default function FriendsIndex({ friends, pendingReceived, pendingSent }: FriendsIndexProps) {
    const [isResponding, setIsResponding] = useState<number | null>(null);
    const [isRemoving, setIsRemoving] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Friends', href: '/friends' },
    ];

    const handleRespond = (friendshipId: number, status: 'accepted' | 'declined') => {
        setIsResponding(friendshipId);
        router.patch(`/friends/${friendshipId}/respond`, { status }, {
            preserveScroll: true,
            onFinish: () => setIsResponding(null),
        });
    };

    const handleRemove = (friendshipId: number) => {
        setIsRemoving(friendshipId);
        router.delete(`/friends/${friendshipId}`, {
            preserveScroll: true,
            onFinish: () => setIsRemoving(null),
        });
    };

    const handleCancelRequest = (friendshipId: number) => {
        setIsRemoving(friendshipId);
        router.delete(`/friends/${friendshipId}`, {
            preserveScroll: true,
            onFinish: () => setIsRemoving(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Friends" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                            <Users className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Friends</h1>
                            <p className="text-sm text-muted-foreground">
                                {friends.length} friend{friends.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/friends/add">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Friend
                        </Link>
                    </Button>
                </div>

                {/* Pending Requests Received */}
                {pendingReceived.length > 0 && (
                    <div className="rounded-xl border bg-card p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <h2 className="font-semibold">Friend Requests</h2>
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                {pendingReceived.length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {pendingReceived.map((request) => (
                                <div key={request.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar user={request.sender} />
                                        <div>
                                            <p className="font-medium">{request.sender.name}</p>
                                            <p className="text-sm text-muted-foreground">{request.sender.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            disabled={isResponding === request.id}
                                            onClick={() => handleRespond(request.id, 'accepted')}
                                        >
                                            <Check className="mr-1 h-4 w-4" />
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isResponding === request.id}
                                            onClick={() => handleRespond(request.id, 'declined')}
                                        >
                                            <X className="mr-1 h-4 w-4" />
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Requests Sent */}
                {pendingSent.length > 0 && (
                    <div className="rounded-xl border bg-card p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <h2 className="font-semibold">Sent Requests</h2>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {pendingSent.length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {pendingSent.map((request) => (
                                <div key={request.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar user={request.receiver} />
                                        <div>
                                            <p className="font-medium">{request.receiver.name}</p>
                                            <p className="text-sm text-muted-foreground">{request.receiver.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={isRemoving === request.id}
                                        onClick={() => handleCancelRequest(request.id)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Friends List */}
                <div className="rounded-xl border bg-card p-4">
                    <h2 className="mb-4 font-semibold">All Friends</h2>
                    {friends.length === 0 ? (
                        <div className="py-8 text-center">
                            <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No friends yet</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add friends to share job opportunities with them
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {friends.map((friend) => (
                                <div key={friend.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar user={friend} />
                                        <div>
                                            <p className="font-medium">{friend.name}</p>
                                            <p className="text-sm text-muted-foreground">{friend.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
