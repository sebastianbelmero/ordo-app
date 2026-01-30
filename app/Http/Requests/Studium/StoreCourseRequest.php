<?php

declare(strict_types=1);

namespace App\Http\Requests\Studium;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
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
            'code' => ['nullable', 'string', 'max:50'],
            'credits' => ['nullable', 'integer', 'min:1', 'max:10'],
            'lecturer_name' => ['nullable', 'string', 'max:255'],
            'lecturer_contact' => ['nullable', 'string', 'max:255'],
            'schedule_data' => ['nullable', 'array'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama mata kuliah harus diisi.',
            'name.max' => 'Nama mata kuliah maksimal 255 karakter.',
            'credits.min' => 'SKS minimal 1.',
            'credits.max' => 'SKS maksimal 10.',
        ];
    }
}
