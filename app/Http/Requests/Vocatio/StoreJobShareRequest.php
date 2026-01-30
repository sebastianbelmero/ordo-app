<?php

declare(strict_types=1);

namespace App\Http\Requests\Vocatio;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobShareRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert email to receiver_id if email is provided
        if ($this->has('shared_with_email') && ! $this->has('receiver_id')) {
            $user = User::where('email', $this->shared_with_email)->first();
            if ($user) {
                $this->merge([
                    'receiver_id' => $user->id,
                ]);
            }
        }
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'job_id' => ['required', 'uuid', 'exists:vocatio_jobs,id'],
            'shared_with_email' => ['required_without:receiver_id', 'email'],
            'receiver_id' => ['required', 'integer', 'exists:users,id', 'different:sender_id'],
            'message' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'job_id.required' => 'Job harus dipilih.',
            'job_id.exists' => 'Job tidak ditemukan.',
            'shared_with_email.required_without' => 'Email penerima harus diisi.',
            'shared_with_email.email' => 'Format email tidak valid.',
            'receiver_id.required' => 'Pengguna dengan email tersebut tidak ditemukan.',
            'receiver_id.exists' => 'Pengguna dengan email tersebut tidak ditemukan.',
            'receiver_id.different' => 'Tidak bisa share ke diri sendiri.',
        ];
    }
}
