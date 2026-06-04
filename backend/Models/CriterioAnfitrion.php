<?php

declare(strict_types=1);

namespace App\Models;

final class CriterioAnfitrion extends BaseModel
{
    public const STATUSES = ['activo', 'inactivo'];

    public function __construct(
        ?int $id,
        public int $anfitrionId,
        public string $criterio,
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
            self::intValue($data, 'anfitrion_id'),
            self::requireString($data, 'criterio'),
            self::requireString($data, 'valor'),
            self::assertIn((string) ($data['estado'] ?? 'activo'), self::STATUSES, 'estado'),
        );
    }

    public function toArray(): array
    {
        return $this->baseArray() + [
            'anfitrion_id' => $this->anfitrionId,
            'criterio' => $this->criterio,
            'valor' => $this->valor,
            'estado' => $this->estado,
        ];
    }
}
