<?php

namespace App\Exceptions;

use RuntimeException;

class BookingConflictException extends RuntimeException
{
    public function __construct(
        string $message,
        private readonly array $errors = [],
        private readonly int $statusCode = 409
    ) {
        parent::__construct($message);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function statusCode(): int
    {
        return $this->statusCode;
    }
}
