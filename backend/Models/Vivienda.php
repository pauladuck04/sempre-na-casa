<?php

declare(strict_types=1);

namespace App\Models;

use InvalidArgumentException;

final class Vivienda extends BaseModel
{
    public const STATUSES = ['disponible', 'ocupada', 'inactivo'];

    public function __construct(
        ?int $id,
        public string $direccion,
        public string $ciudad,
        public int $plazasLibres,
        public int $plazasTotales,
        public int $anfitrionId,
        public ?string $anfitrion = null,
        public ?string $descripcion = null,
        public string $estado = 'disponible',
    ) {
        parent::__construct($id);
        self::assertIn($this->estado, self::STATUSES, 'estado');

        if ($this->plazasTotales < 1 || $this->plazasLibres < 0 || $this->plazasLibres > $this->plazasTotales) {
            throw new InvalidArgumentException('Las plazas de la vivienda no son validas.');
        }
    }

    public static function fromArray(array $data): static
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            self::requireString($data, 'direccion'),
            self::requireString($data, 'ciudad'),
            self::intValue($data, 'plazas_libres'),
            self::intValue($data, 'plazas_totales'),
            self::intValue($data, 'anfitrion_id'),
            self::optionalString($data, 'anfitrion'),
            self::optionalString($data, 'descripcion'),
            self::assertIn((string) ($data['estado'] ?? 'disponible'), self::STATUSES, 'estado'),
        );
    }

    public function toArray(): array
    {
        return $this->baseArray() + [
            'direccion' => $this->direccion,
            'ciudad' => $this->ciudad,
            'plazas_libres' => $this->plazasLibres,
            'plazas_totales' => $this->plazasTotales,
            'anfitrion_id' => $this->anfitrionId,
            'anfitrion' => $this->anfitrion,
            'descripcion' => $this->descripcion,
            'estado' => $this->estado,
        ];
    }
}
