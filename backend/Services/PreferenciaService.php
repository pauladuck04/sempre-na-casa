<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Preferencia;

final class PreferenciaService extends BaseService
{
    public function create(array $data): Preferencia
    {
        /** @var Preferencia $preferencia */
        $preferencia = $this->save(Preferencia::fromArray($data));

        return $preferencia;
    }

    /**
     * @return array<int, Preferencia>
     */
    public function byUsuario(int $usuarioId): array
    {
        return array_values(array_filter(
            $this->items,
            fn ($preferencia) => $preferencia instanceof Preferencia && $preferencia->usuarioId === $usuarioId
        ));
    }

    public function changeStatus(int $id, string $estado): Preferencia
    {
        /** @var Preferencia $preferencia */
        $preferencia = $this->requireFound($id);
        $preferencia->estado = Preferencia::assertIn($estado, Preferencia::STATUSES, 'estado');

        return $preferencia;
    }
}
