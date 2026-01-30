<?php

declare(strict_types=1);

namespace App\Http\Requests\Vocatio;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobRequest extends FormRequest
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
            'company' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:2048'],
            'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'level_of_interest' => ['nullable', 'integer', 'min:1', 'max:5'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0', 'gte:salary_min'],
            'status_id' => ['nullable', 'integer', 'exists:vocatio_job_statuses,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'company.required' => 'Nama perusahaan harus diisi.',
            'position.required' => 'Posisi harus diisi.',
            'url.url' => 'Format URL tidak valid.',
            'level_of_interest.min' => 'Level interest minimal 1.',
            'level_of_interest.max' => 'Level interest maksimal 5.',
            'salary_max.gte' => 'Gaji maksimal harus lebih besar dari gaji minimal.',
        ];
    }
}
