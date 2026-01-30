<?php

declare(strict_types=1);

namespace App\Http\Requests\Vocatio;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePipelineRequest extends FormRequest
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
            'is_default' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama pipeline harus diisi.',
            'name.max' => 'Nama pipeline maksimal 255 karakter.',
        ];
    }
}
