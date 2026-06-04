<?php

declare(strict_types=1);

namespace App\Models;

final class Preferencia extends BaseModel
{
    public const STATUSES = ['activo', 'inactivo'];

    public function __construct(
        ?int $id,
        public int $usuarioId,
        public string $preferencia,
        public string $valor,
        public string $estado = 'activo',
    ) {
        parent::__construct($id);
        self::assertIn($this->estado, self::STATUSES, 'estado');
    }

    public static function fromArray(array $data): static
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            self::intValue($data, 'usuario_id'),
            self::requireString($data, 'preferencia'),
            self::requireString($data, 'valor'),
            self::assertIn((string) ($data['estado'] ?? 'activo'), self::STATUSES, 'estado'),
        );
    }

    public function toArray(): array
    {
        return $this->baseArray() + [
            'usuario_id' => $this->usuarioId,
            'preferencia' => $this->preferencia,
            'valor' => $this->valor,
            'estado' => $this->estado,
        ];
    }
}
