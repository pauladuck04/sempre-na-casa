<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Criterio;
use App\Models\OpcionCriterio;

final class CriterioService extends BaseService
{
    /** @var array<int, OpcionCriterio> */
    private array $opciones = [];

    private int $nextOptionId = 1;

    public function create(array $data): Criterio
    {
        /** @var Criterio $criterio */
        $criterio = $this->save(Criterio::fromArray($data));

        return $criterio;
    }

    public function createOption(array $data): OpcionCriterio
    {
        $option = OpcionCriterio::fromArray($data);

        if ($option->id === null) {
            $option->id = $this->nextOptionId++;
        }

        $this->opciones[$option->id] = $option;

        return $option;
    }

    /**
     * @return array<int, OpcionCriterio>
     */
    public function options(?int $criterioId = null): array
    {
        if ($criterioId === null) {
            return array_values($this->opciones);
        }

        return array_values(array_filter(
            $this->opciones,
            fn (OpcionCriterio $opcion) => $opcion->criterioId === $criterioId
        ));
    }

    public function changeStatus(int $id, string $estado): Criterio
    {
        /** @var Criterio $criterio */
        $criterio = $this->requireFound($id);
        $criterio->estado = Criterio::assertIn($estado, Criterio::STATUSES, 'estado');

        return $criterio;
    }
}
