<?php

declare(strict_types=1);

namespace App\Models;

final class PasswordResetToken extends BaseModel
{
    public function __construct(
        ?int $id,
        public int $usuarioId,
        public string $tokenHash,
        public string $expiresAt,
        public ?string $usedAt = null,
    ) {
        parent::__construct($id);
    }

    public static function fromArray(array $data): static
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            self::intValue($data, 'usuario_id'),
            self::requireString($data, 'token_hash'),
            self::requireString($data, 'expires_at'),
            self::optionalString($data, 'used_at'),
        );
    }

    public function toArray(): array
    {
        return $this->baseArray() + [
            'usuario_id' => $this->usuarioId,
            'token_hash' => $this->tokenHash,
            'expires_at' => $this->expiresAt,
            'used_at' => $this->usedAt,
        ];
    }
}
