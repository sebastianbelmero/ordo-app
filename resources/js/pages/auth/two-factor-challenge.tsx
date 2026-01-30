// This page is not used - Google OAuth handles authentication
import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function TwoFactorChallenge() {
    return (
        <AuthLayout
            title="Two-Factor Authentication"
            description="This feature is not available with Google OAuth login."
        >
            <Head title="Two-Factor Authentication" />
            <p className="text-center text-muted-foreground">
                Two-factor authentication is handled by Google. Please enable 2FA in your Google account settings for additional security.
            </p>
        </AuthLayout>
    );
}
