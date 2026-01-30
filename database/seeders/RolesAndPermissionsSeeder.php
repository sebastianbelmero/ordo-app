<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Activity logs
            'view activity logs',

            // User management
            'view users',
            'manage users',

            // Module management
            'manage modules',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create admin role with all permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Create user role (default)
        Role::firstOrCreate(['name' => 'user']);

        // Assign admin role to specific email if user exists
        $adminUser = User::where('email', 'sebastianbelmerositorus@gmail.com')->first();
        if ($adminUser && !$adminUser->hasRole('admin')) {
            $adminUser->assignRole('admin');
        }
    }
}
