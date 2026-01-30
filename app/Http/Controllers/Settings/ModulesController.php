<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UserModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * MODULES CONTROLLER
 * ======================================================================================
 *
 * Manages user module activation (Opus, Studium, Vocatio).
 *
 * ======================================================================================
 */
class ModulesController extends Controller
{
    /**
     * Available modules configuration.
     */
    private const AVAILABLE_MODULES = [
        'opus' => [
            'name' => 'Opus',
            'description' => 'Project & Task Management dengan Kanban board',
            'icon' => 'FolderKanban',
            'color' => 'purple',
        ],
        'studium' => [
            'name' => 'Studium',
            'description' => 'Academic Management untuk mahasiswa',
            'icon' => 'GraduationCap',
            'color' => 'blue',
        ],
        'vocatio' => [
            'name' => 'Vocatio',
            'description' => 'Job Application Tracker',
            'icon' => 'Briefcase',
            'color' => 'green',
        ],
    ];

    /**
     * Display the modules settings page.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $userModules = $user->modules()->get()->keyBy('module');

        $modules = collect(self::AVAILABLE_MODULES)->map(function ($config, $key) use ($userModules) {
            $userModule = $userModules->get($key);

            return [
                'key' => $key,
                'name' => $config['name'],
                'description' => $config['description'],
                'icon' => $config['icon'],
                'color' => $config['color'],
                'is_enabled' => $userModule?->is_enabled ?? false,
                'order' => $userModule?->order ?? 0,
            ];
        })->values();

        return Inertia::render('settings/modules', [
            'modules' => $modules,
        ]);
    }

    /**
     * Toggle a module's enabled status.
     */
    public function toggle(Request $request, string $module): RedirectResponse
    {
        if (! array_key_exists($module, self::AVAILABLE_MODULES)) {
            return back()->with('error', 'Module tidak ditemukan.');
        }

        $user = Auth::user();

        $userModule = UserModule::firstOrNew([
            'user_id' => $user->id,
            'module' => $module,
        ]);

        $userModule->is_enabled = ! $userModule->is_enabled;

        if (! $userModule->exists) {
            // Set order for new modules
            $maxOrder = $user->modules()->max('order') ?? 0;
            $userModule->order = $maxOrder + 1;
        }

        $userModule->save();

        $status = $userModule->is_enabled ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', self::AVAILABLE_MODULES[$module]['name'] . " berhasil {$status}.");
    }

    /**
     * Update module order.
     */
    public function updateOrder(Request $request): RedirectResponse
    {
        $request->validate([
            'modules' => ['required', 'array'],
            'modules.*.key' => ['required', 'string', 'in:opus,studium,vocatio'],
            'modules.*.order' => ['required', 'integer', 'min:0'],
        ]);

        $user = Auth::user();

        foreach ($request->modules as $moduleData) {
            UserModule::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'module' => $moduleData['key'],
                ],
                [
                    'order' => $moduleData['order'],
                ]
            );
        }

        return back()->with('success', 'Urutan modul berhasil diperbarui.');
    }
}
