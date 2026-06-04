<?php

declare(strict_types=1);

namespace App\Models;

final class OpcionCriterio extends BaseModel
{
    public const STATUSES = ['activo', 'inactivo'];

    public function __construct(
        ?int $id,
        public int $criterioId,
        public string $opcion,
        public int $valor,
        public ?string $criterio = null,
        public string $estado = 'activo',
    ) {
        parent::__construct($id);
        self::assertIn($this->estado, self::STATUSES, 'estado');
    }

    public static function fromArray(array $data): static
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            self::intValue($data, 'criterio_id'),
            self::requireString($data, 'opcion'),
            self::intValue($data, 'valor'),
            self::optionalString($data, 'criterio'),
            self::assertIn((string) ($data['estado'] ?? 'activo'), self::STATUSES, 'estado'),
        );
    }

    public function toArray(): array
    {
        return $this->baseArray() + [
            'criterio_id' => $this->criterioId,
            'criterio' => $this->criterio,
            'opcion' => $this->opcion,
            'valor' => $this->valor,
            'estado' => $this->estado,
        ];
    }
}
