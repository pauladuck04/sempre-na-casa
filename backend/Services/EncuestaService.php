<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\RespuestaEncuesta;

final class EncuestaService extends BaseService
{
    public function saveRespuesta(array $data): RespuestaEncuesta
    {
        /** @var RespuestaEncuesta $respuesta */
        $respuesta = $this->save(RespuestaEncuesta::fromArray($data));

        return $respuesta;
    }

    /**
     * @param array<int, array<string, mixed>> $respuestas
     * @return array<int, RespuestaEncuesta>
     */
    public function saveSurvey(int $usuarioId, array $respuestas): array
    {
        $saved = [];

        foreach ($respuestas as $respuesta) {
            $respuesta['usuario_id'] = $usuarioId;
            $saved[] = $this->saveRespuesta($respuesta);
        }

        return $saved;
    }

    /**
     * @return array<int, RespuestaEncuesta>
     */
    public function byUsuario(int $usuarioId): array
    {
        return array_values(array_filter(
            $this->items,
            fn ($respuesta) => $respuesta instanceof RespuestaEncuesta && $respuesta->usuarioId === $usuarioId
        ));
    }
}
