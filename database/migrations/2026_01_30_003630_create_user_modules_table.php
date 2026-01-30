<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // User Modules - Mengatur modul mana yang aktif untuk setiap user
        // Data tidak hilang saat modul di-hide, hanya visibility-nya yang berubah
        Schema::create('user_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('module'); // 'opus', 'studium', 'vocatio'
            $table->boolean('is_enabled')->default(true);
            $table->integer('order')->default(0); // Urutan tampilan di sidebar/dashboard
            $table->json('settings')->nullable(); // Pengaturan khusus per modul (misal: default view, dll)
            $table->timestamps();

            $table->unique(['user_id', 'module']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_modules');
    }
};
