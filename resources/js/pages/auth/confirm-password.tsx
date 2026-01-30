// This page is not used - Google OAuth handles authentication
import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    return (
        <AuthLayout
            title="Confirm your password"
            description="This feature is not available with Google OAuth login."
        >
            <Head title="Confirm password" />
            <p className="text-center text-muted-foreground">
                Password confirmation is handled by Google. Please visit your Google account settings for security options.
            </p>
        </AuthLayout>
    );
}
