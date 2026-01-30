<?php

declare(strict_types=1);

namespace App\Http\Requests\Studium;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssignmentRequest extends FormRequest
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
            'type_id' => ['nullable', 'integer', 'exists:studium_assignment_types,id'],
            'deadline' => ['nullable', 'date'],
            'grade' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul tugas harus diisi.',
            'title.max' => 'Judul tugas maksimal 255 karakter.',
            'type_id.exists' => 'Tipe tugas tidak valid.',
            'grade.min' => 'Nilai minimal 0.',
            'grade.max' => 'Nilai maksimal 100.',
        ];
    }
}
