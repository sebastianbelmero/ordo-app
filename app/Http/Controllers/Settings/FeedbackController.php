<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\FeedbackStoreRequest;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

/**
 * FeedbackController
 *
 * Controller untuk halaman feedback.
 * User dapat mengirim laporan bug, request fitur, atau feedback lainnya ke developer.
 */
class FeedbackController extends Controller
{
    /**
     * Show the feedback form page.
     */
    public function index(Request $request): Response
    {
        $feedbacks = Feedback::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('settings/feedback', [
            'feedbacks' => $feedbacks,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Store a new feedback.
     */
    public function store(FeedbackStoreRequest $request): RedirectResponse
    {
        $feedback = Feedback::create([
            'user_id' => $request->user()->id,
            'type' => $request->validated('type'),
            'subject' => $request->validated('subject'),
            'message' => $request->validated('message'),
        ]);

        // Send email notification to developer
        $this->sendFeedbackEmail($feedback, $request->user());

        return to_route('settings.feedback')
            ->with('status', 'Feedback berhasil dikirim! Terima kasih atas masukan Anda.');
    }

    /**
     * Send feedback email notification to developer.
     */
    private function sendFeedbackEmail(Feedback $feedback, $user): void
    {
        $developerEmail = 'sebastianbelmero@gmail.com';

        $typeLabels = [
            'bug_report' => 'Laporan Bug',
            'feature_request' => 'Permintaan Fitur',
            'general' => 'Feedback Umum',
            'other' => 'Lainnya',
        ];

        $subject = "[Ordo Feedback] {$typeLabels[$feedback->type]}: {$feedback->subject}";

        $content = <<<EMAIL
        Feedback baru telah dikirim:

        Dari: {$user->name} ({$user->email})
        Tipe: {$typeLabels[$feedback->type]}
        Subjek: {$feedback->subject}

        Pesan:
        {$feedback->message}

        ---
        Dikirim pada: {$feedback->created_at->format('d F Y H:i')}
        EMAIL;

        Mail::raw($content, function ($message) use ($developerEmail, $subject) {
            $message->to($developerEmail)
                ->subject($subject);
        });
    }
}
