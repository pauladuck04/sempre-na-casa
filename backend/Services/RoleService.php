<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Role;

final class RoleService extends BaseService
{
    public function create(array $data): Role
    {
        /** @var Role $role */
        $role = $this->save(Role::fromArray($data));

        return $role;
    }

    public function changeStatus(int $id, string $estado): Role
    {
        /** @var Role $role */
        $role = $this->requireFound($id);
        $role->estado = Role::assertIn($estado, Role::STATUSES, 'estado');

        return $role;
    }
}
