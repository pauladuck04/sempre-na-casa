<?php

declare(strict_types=1);

namespace App\Models;

use InvalidArgumentException;

final class Convivencia extends BaseModel
{
    public const STATUSES = ['activo', 'entrevista', 'prueba', 'inactivo', 'finalizada'];

    public function __construct(
        ?int $id,
        public int $viviendaId,
        public int $anfitrionId,
        public int $inquilinoId,
        public string $estado = 'entrevista',
        public ?string $fechaInicio = null,
        public int $compatibilidad = 0,
    ) {
        parent::__construct($id);
        self::assertIn($this->estado, self::STATUSES, 'estado');

        if ($this->compatibilidad < 0 || $this->compatibilidad > 100) {
            throw new InvalidArgumentException('La compatibilidad debe estar entre 0 y 100.');
        }
    }

    public static function fromArray(array $data): static
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            self::intValue($data, 'vivienda_id'),
            self::intValue($data, 'anfitrion_id'),
            self::intValue($data, 'inquilino_id'),
            self::assertIn((string) ($data['estado'] ?? 'entrevista'), self::STATUSES, 'estado'),
            (string) ($data['fechaInicio'] ?? $data['fecha_inicio'] ?? ''),
            self::intValue($data, 'compatibilidad'),
        );
    }

    public function toArray(): array
    {
        return $this->baseArray() + [
            'vivienda_id' => $this->viviendaId,
            'anfitrion_id' => $this->anfitrionId,
            'inquilino_id' => $this->inquilinoId,
            'estado' => $this->estado,
            'fechaInicio' => $this->fechaInicio,
            'compatibilidad' => $this->compatibilidad,
        ];
    }
}
