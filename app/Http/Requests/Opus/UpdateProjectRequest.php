<?php

declare(strict_types=1);

namespace App\Http\Requests\Opus;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'status_id' => ['nullable', 'integer', 'exists:opus_project_statuses,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama project harus diisi.',
            'name.max' => 'Nama project maksimal 255 karakter.',
            'status_id.exists' => 'Status tidak valid.',
        ];
    }
}
