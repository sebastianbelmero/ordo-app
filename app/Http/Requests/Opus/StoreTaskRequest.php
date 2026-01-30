<?php

declare(strict_types=1);

namespace App\Http\Requests\Opus;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status_id' => ['nullable', 'integer', 'exists:opus_task_statuses,id'],
            'priority_id' => ['nullable', 'integer', 'exists:opus_task_priorities,id'],
            'due_date' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul task harus diisi.',
            'title.max' => 'Judul task maksimal 255 karakter.',
            'status_id.exists' => 'Status tidak valid.',
            'priority_id.exists' => 'Priority tidak valid.',
            'due_date.date' => 'Format tanggal tidak valid.',
        ];
    }
}
