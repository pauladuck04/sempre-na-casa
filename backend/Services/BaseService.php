<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\BaseModel;
use InvalidArgumentException;

abstract class BaseService
{
    /** @var array<int, BaseModel> */
    protected array $items = [];

    protected int $nextId = 1;

    /**
     * @return array<int, BaseModel>
     */
    public function all(): array
    {
        return array_values($this->items);
    }

    public function find(int $id): ?BaseModel
    {
        return $this->items[$id] ?? null;
    }

    public function delete(int $id): void
    {
        unset($this->items[$id]);
    }

    protected function save(BaseModel $model): BaseModel
    {
        if ($model->id === null) {
            $model->id = $this->nextId++;
        }

        $this->items[$model->id] = $model;

        return $model;
    }

    protected function requireFound(int $id): BaseModel
    {
        $model = $this->find($id);

        if ($model === null) {
            throw new InvalidArgumentException("No existe el registro {$id}.");
        }

        return $model;
    }
}
