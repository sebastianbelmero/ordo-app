// This page is not used - Google OAuth handles email verification
import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail() {
    return (
        <AuthLayout
            title="Verify email"
            description="This page is not used with Google OAuth login."
        >
            <Head title="Email verification" />
            <p className="text-center text-muted-foreground">
                Email verification is handled by Google OAuth.
            </p>
        </AuthLayout>
    );
}
