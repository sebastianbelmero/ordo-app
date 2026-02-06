<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use App\Models\Opus\Task;
use App\Models\Studium\Course;
use App\Models\Vocatio\Job;
use App\Services\Google\GoogleCalendarService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TelegramWebhookController extends Controller
{
    public function __construct(
        private GoogleCalendarService $calendarService
    ) {}

    public function handle(Request $request)
    {
        // Validasi webhook secret untuk keamanan
        $secret = config('telegram.webhook_secret');
        if ($secret && $request->header('X-Telegram-Bot-Api-Secret-Token') !== $secret) {
            Log::warning('Invalid Telegram webhook secret');
            return response()->json(['status' => 'unauthorized'], 401);
        }

        $update = $request->all();

        // 1. Cek apakah ini pesan teks biasa atau klik tombol
        if (isset($update['message'])) {
            $this->handleMessage($update['message']);
        } elseif (isset($update['callback_query'])) {
            $this->handleButton($update['callback_query']);
        }

        return response()->json(['status' => 'ok']);
    }

    protected function handleMessage($message)
    {
        $chatId = $message['chat']['id'];
        $text = $message['text'] ?? '';

        // LOGIC 1: Akun Linking (Saat user klik link start)
        if (str_starts_with($text, '/start CONNECT-')) {
            $code = str_replace('/start ', '', $text);
            $user = User::where('telegram_auth_code', $code)->first();

            if ($user) {
                $user->update([
                    'telegram_chat_id' => $chatId,
                    'telegram_auth_code' => null // Reset kode agar aman
                ]);
                $this->sendMessage($chatId, "✅ Halo {$user->name}! Akun Ordo berhasil terhubung.");
                $this->showMainMenu($chatId);
            } else {
                $this->sendMessage($chatId, "❌ Kode tidak valid atau kadaluarsa.");
            }
            return;
        }

        // Cek apakah user sudah terhubung
        $user = User::where('telegram_chat_id', $chatId)->first();
        if (!$user) {
            $this->sendMessage($chatId, "⚠️ Akun belum terhubung. Silakan login ke Web Ordo untuk menghubungkan.");
            return;
        }

        // Tampilkan Menu Utama jika user ketik apapun
        $this->showMainMenu($chatId);
    }

    protected function handleButton($callback)
    {
        $chatId = $callback['message']['chat']['id'];
        $data = $callback['data']; // Data tombol yang diklik

        $user = User::where('telegram_chat_id', $chatId)->first();
        if (!$user) return;

        switch ($data) {
            case 'view_schedule':
                // Ambil data dari tabel Studium (Jadwal)
                $today = now()->format('l'); // 'Monday', 'Tuesday', etc
                
                // Query courses through programs -> semesters -> courses
                $courses = Course::whereHas('semester.program', function($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })
                    ->whereRaw("JSON_EXTRACT(schedule_data, '$.day') = ?", [$today])
                    ->orderByRaw("JSON_EXTRACT(schedule_data, '$.start')")
                    ->limit(10)
                    ->get();

                if ($courses->isEmpty()) {
                    $reply = "🏖️ Tidak ada jadwal kuliah hari ini ($today).";
                } else {
                    $reply = "📅 *Jadwal Kuliah Hari Ini:*\n";
                    foreach ($courses as $c) {
                        $schedule = json_decode($c->schedule_data, true);
                        $time = $schedule['start'] ?? '';
                        $room = $schedule['room'] ?? '';
                        $reply .= "⏰ {$time} - {$c->name}";
                        if ($room) $reply .= " ({$room})";
                        $reply .= "\n";
                    }
                }
                break;

            case 'view_tasks':
                // Ambil data dari tabel Opus (Tugas)
                // Query tasks through workspaces -> projects -> tasks
                $tasks = Task::whereHas('project.workspace', function($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })
                    ->whereHas('status', function($q) {
                        $q->where('is_completed', false);
                    })
                    ->whereNotNull('due_date')
                    ->orderBy('due_date')
                    ->limit(5)
                    ->get();

                if ($tasks->isEmpty()) {
                    $reply = "🎉 Tidak ada tugas pending! Kerja bagus.";
                } else {
                    $reply = "📝 *Tugas Pending (Top 5):*\n";
                    foreach ($tasks as $t) {
                        $deadline = \Carbon\Carbon::parse($t->due_date)->format('d M');
                        $reply .= "▫️ {$t->title} (Deadline: $deadline)\n";
                    }
                }
                break;

            case 'view_jobs':
                // Ambil data interview dari Vocatio (status 'interview')
                $jobs = Job::where('user_id', $user->id)
                    ->whereHas('status', function($q) {
                        $q->where('slug', 'interview');
                    })
                    ->whereNotNull('due_date')
                    ->orderBy('due_date')
                    ->limit(5)
                    ->get();

                if ($jobs->isEmpty()) {
                    $reply = "📋 Tidak ada interview yang dijadwalkan.";
                } else {
                    $reply = "💼 *Interview Terjadwal (Top 5):*\n";
                    foreach ($jobs as $j) {
                        $date = \Carbon\Carbon::parse($j->due_date)->format('d M');
                        $reply .= "▫️ {$j->position} di {$j->company} ({$date})\n";
                    }
                }
                break;

            case 'view_calendar':
                // Ambil agenda 7 hari ke depan LANGSUNG dari Google Calendar
                $today = \Carbon\Carbon::now()->startOfDay();
                $endDate = \Carbon\Carbon::now()->addDays(7)->endOfDay();
                
                if (!$user->hasGoogleCalendarConnected() || !$user->google_calendar_enabled) {
                    $reply = "❌ Google Calendar belum terhubung.\n\n";
                    $reply .= "Silakan hubungkan Google Calendar di:\n";
                    $reply .= "Settings → Google Calendar Integration";
                    break;
                }
                
                try {
                    $gcalEvents = $this->calendarService->getEvents($user, $today, $endDate);
                    
                    if (empty($gcalEvents)) {
                        $reply = "🏖️ Tidak ada agenda dalam 7 hari ke depan di Google Calendar.";
                    } else {
                        $reply = "📅 *Agenda 7 Hari Ke Depan (Google Calendar):*\n\n";
                        
                        $currentDate = null;
                        $count = 0;
                        $maxItems = 20;
                        
                        foreach ($gcalEvents as $event) {
                            if ($count >= $maxItems) {
                                $remaining = count($gcalEvents) - $maxItems;
                                $reply .= "\n_...dan {$remaining} agenda lainnya_";
                                break;
                            }
                            
                            $eventDate = \Carbon\Carbon::parse($event['start'])->format('Y-m-d');
                            
                            // Add date separator
                            if ($currentDate !== $eventDate) {
                                $currentDate = $eventDate;
                                $dateLabel = \Carbon\Carbon::parse($event['start'])->format('D, d M');
                                $reply .= "\n*{$dateLabel}*\n";
                            }
                            
                            if ($event['all_day']) {
                                $reply .= "  📌 {$event['title']}";
                            } else {
                                $timeStr = \Carbon\Carbon::parse($event['start'])->format('H:i');
                                $reply .= "  ⏰ {$timeStr} - {$event['title']}";
                            }
                            $reply .= "\n";
                            
                            $count++;
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Telegram bot failed to fetch Google Calendar: ' . $e->getMessage());
                    $reply = "❌ Gagal mengambil data dari Google Calendar.\n";
                    $reply .= "Silakan coba lagi atau periksa koneksi Google Calendar Anda.";
                }
                break;

            default:
                $reply = "Menu tidak dikenali.";
        }

        $this->sendMessage($chatId, $reply);
    }

    // Helper untuk kirim pesan text
    protected function sendMessage($chatId, $text)
    {
        $token = config('telegram.bot_token');
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'Markdown'
        ]);
    }

    // Helper untuk kirim menu tombol
    protected function showMainMenu($chatId)
    {
        $token = config('telegram.bot_token');
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => "Apa yang ingin kamu lihat?",
            'reply_markup' => json_encode([
                'inline_keyboard' => [
                    [
                        ['text' => '📅 Agenda 7 Hari', 'callback_data' => 'view_calendar']
                    ],
                    [
                        ['text' => '📚 Jadwal Kuliah', 'callback_data' => 'view_schedule'],
                        ['text' => '📝 Tugas', 'callback_data' => 'view_tasks']
                    ],
                    [
                        ['text' => '💼 Interview Kerja', 'callback_data' => 'view_jobs']
                    ]
                ]
            ])
        ]);
    }

    public function generateAuthCode(Request $request)
    {
        $code = 'CONNECT-' . strtoupper(Str::random(6));
        // Simpan kode sementara ke user
        $request->user()->forceFill([
            'telegram_auth_code' => $code
        ])->save();

        $botUsername = config('telegram.bot_username');
        $botUrl = "https://t.me/{$botUsername}";

        return response()->json([
            'code' => $code,
            'bot_username' => $botUsername,
            'bot_url' => $botUrl,
        ]);
    }
}
