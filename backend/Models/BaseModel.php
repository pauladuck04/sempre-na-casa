<?php

declare(strict_types=1);

namespace App\Models;

use DateTimeImmutable;
use InvalidArgumentException;

abstract class BaseModel
{
    public function __construct(
        public ?int $id = null,
        public ?DateTimeImmutable $createdAt = null,
        public ?DateTimeImmutable $updatedAt = null,
    ) {
        $this->createdAt ??= new DateTimeImmutable();
        $this->updatedAt ??= new DateTimeImmutable();
    }

    abstract public static function fromArray(array $data): static;

    abstract public function toArray(): array;

    protected static function requireString(array $data, string $key): string
    {
        $value = trim((string) ($data[$key] ?? ''));

        if ($value === '') {
            throw new InvalidArgumentException("El campo {$key} es obligatorio.");
        }

        return $value;
    }

    protected static function optionalString(array $data, string $key): ?string
    {
        $value = trim((string) ($data[$key] ?? ''));

        return $value === '' ? null : $value;
    }

    protected static function intValue(array $data, string $key, int $default = 0): int
    {
        return isset($data[$key]) ? (int) $data[$key] : $default;
    }

    protected static function dateValue(array $data, string $key): ?DateTimeImmutable
    {
        if (empty($data[$key])) {
            return null;
        }

        return new DateTimeImmutable((string) $data[$key]);
    }

    public static function assertIn(string $value, array $allowed, string $field): string
    {
        if (!in_array($value, $allowed, true)) {
            throw new InvalidArgumentException("Valor no valido para {$field}: {$value}.");
        }

        return $value;
    }

    protected function baseArray(): array
    {
        return [
            'id' => $this->id,
            'created_at' => $this->createdAt?->format(DATE_ATOM),
            'updated_at' => $this->updatedAt?->format(DATE_ATOM),
        ];
    }
}
