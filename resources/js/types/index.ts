export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type UserModule = {
    id: number;
    user_id: number;
    module: 'opus' | 'studium' | 'vocatio';
    is_enabled: boolean;
    order: number;
    settings: string | null;
    created_at: string;
    updated_at: string;
};

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    userModules: UserModule[];
    isAdmin: boolean;
    [key: string]: unknown;
};

// Activity Log Types
export type ActivityLog = {
    id: number;
    log_name: string | null;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    properties: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    causer?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    } | null;
    subject?: {
        id: number;
        [key: string]: unknown;
    } | null;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};
