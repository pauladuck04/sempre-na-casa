<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Convivencia;

final class ConvivenciaService extends BaseService
{
    public function create(array $data): Convivencia
    {
        /** @var Convivencia $convivencia */
        $convivencia = $this->save(Convivencia::fromArray($data));

        return $convivencia;
    }

    public function changeStatus(int $id, string $estado): Convivencia
    {
        /** @var Convivencia $convivencia */
        $convivencia = $this->requireFound($id);
        $convivencia->estado = Convivencia::assertIn($estado, Convivencia::STATUSES, 'estado');

        return $convivencia;
    }

    /**
     * @return array<int, Convivencia>
     */
    public function byInquilino(int $inquilinoId): array
    {
        return array_values(array_filter(
            $this->items,
            fn ($convivencia) => $convivencia instanceof Convivencia && $convivencia->inquilinoId === $inquilinoId
        ));
    }

    /**
     * @return array<int, Convivencia>
     */
    public function byAnfitrion(int $anfitrionId): array
    {
        return array_values(array_filter(
            $this->items,
            fn ($convivencia) => $convivencia instanceof Convivencia && $convivencia->anfitrionId === $anfitrionId
        ));
    }
}
