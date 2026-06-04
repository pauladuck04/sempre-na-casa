<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CriterioAnfitrion;

final class CriterioAnfitrionService extends BaseService
{
    public function create(array $data): CriterioAnfitrion
    {
        /** @var CriterioAnfitrion $criterio */
        $criterio = $this->save(CriterioAnfitrion::fromArray($data));

        return $criterio;
    }

    /**
     * @return array<int, CriterioAnfitrion>
     */
    public function byAnfitrion(int $anfitrionId): array
    {
        return array_values(array_filter(
            $this->items,
            fn ($criterio) => $criterio instanceof CriterioAnfitrion && $criterio->anfitrionId === $anfitrionId
        ));
    }

    public function changeStatus(int $id, string $estado): CriterioAnfitrion
    {
        /** @var CriterioAnfitrion $criterio */
        $criterio = $this->requireFound($id);
        $criterio->estado = CriterioAnfitrion::assertIn($estado, CriterioAnfitrion::STATUSES, 'estado');

        return $criterio;
    }
}
