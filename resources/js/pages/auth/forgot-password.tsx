// This page is not used - Google OAuth handles authentication
import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword() {
    return (
        <AuthLayout
            title="Forgot password"
            description="This feature is not available with Google OAuth login."
        >
            <Head title="Forgot password" />
            <p className="text-center text-muted-foreground">
                Password management is handled by Google. Please visit your Google account settings to manage your password.
            </p>
        </AuthLayout>
    );
}
