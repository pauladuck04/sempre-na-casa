<?php

declare(strict_types=1);

namespace App\Models;

final class Role extends BaseModel
{
    public const STATUSES = ['activo', 'inactivo'];

    public function __construct(
        ?int $id,
        public string $nombre,
        public string $estado = 'activo',
    ) {
        parent::__construct($id);
        self::assertIn($this->estado, self::STATUSES, 'estado');
    }

    public static function fromArray(array $data): static
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            self::requireString($data, 'nombre'),
            self::assertIn((string) ($data['estado'] ?? 'activo'), self::STATUSES, 'estado'),
        );
    }

    public function toArray(): array
    {
        return $this->baseArray() + [
            'nombre' => $this->nombre,
            'estado' => $this->estado,
        ];
    }
}
