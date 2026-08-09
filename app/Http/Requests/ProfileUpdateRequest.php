<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone_number' => ['nullable', 'string', 'regex:/^[0-9+\-\s]{7,15}$/'],
            'area' => ['nullable', 'string', 'max:255'],
            'pickup_address' => ['nullable', 'string', 'max:255'],
            'dropoff_address' => ['nullable', 'string', 'max:255'],
        ];
    }
}
