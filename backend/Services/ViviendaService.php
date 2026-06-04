<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Vivienda;
use InvalidArgumentException;

final class ViviendaService extends BaseService
{
    public function create(array $data): Vivienda
    {
        /** @var Vivienda $vivienda */
        $vivienda = $this->save(Vivienda::fromArray($data));

        return $vivienda;
    }

    public function changeStatus(int $id, string $estado): Vivienda
    {
        /** @var Vivienda $vivienda */
        $vivienda = $this->requireFound($id);
        $vivienda->estado = Vivienda::assertIn($estado, Vivienda::STATUSES, 'estado');

        return $vivienda;
    }

    public function updatePlazas(int $id, int $plazasLibres, int $plazasTotales): Vivienda
    {
        if ($plazasTotales < 1 || $plazasLibres < 0 || $plazasLibres > $plazasTotales) {
            throw new InvalidArgumentException('Las plazas de la vivienda no son validas.');
        }

        /** @var Vivienda $vivienda */
        $vivienda = $this->requireFound($id);
        $vivienda->plazasLibres = $plazasLibres;
        $vivienda->plazasTotales = $plazasTotales;
        $vivienda->estado = $plazasLibres === 0 ? 'ocupada' : 'disponible';

        return $vivienda;
    }

    /**
     * @return array<int, Vivienda>
     */
    public function disponibles(): array
    {
        return array_values(array_filter(
            $this->items,
            fn ($vivienda) => $vivienda instanceof Vivienda && $vivienda->estado === 'disponible'
        ));
    }
}
