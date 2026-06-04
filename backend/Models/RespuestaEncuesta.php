<?php

declare(strict_types=1);

namespace App\Models;

final class RespuestaEncuesta extends BaseModel
{
    public function __construct(
        ?int $id,
        public int $usuarioId,
        public int $criterioId,
        public int $opcionId,
        public ?string $respuestaLibre = null,
    ) {
        parent::__construct($id);
    }

    public static function fromArray(array $data): static
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            self::intValue($data, 'usuario_id'),
            self::intValue($data, 'criterio_id'),
            self::intValue($data, 'opcion_id'),
            self::optionalString($data, 'respuesta_libre'),
        );
    }

    public function toArray(): array
    {
        return $this->baseArray() + [
            'usuario_id' => $this->usuarioId,
            'criterio_id' => $this->criterioId,
            'opcion_id' => $this->opcionId,
            'respuesta_libre' => $this->respuestaLibre,
        ];
    }
}
