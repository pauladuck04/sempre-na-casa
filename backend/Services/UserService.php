<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use InvalidArgumentException;

final class UserService extends BaseService
{
    public function create(array $data): User
    {
        if (!empty($data['password'])) {
            $data['password_hash'] = password_hash((string) $data['password'], PASSWORD_DEFAULT);
        }

        /** @var User $user */
        $user = $this->save(User::fromArray($data));

        return $user;
    }

    public function authenticate(string $email, string $password): User
    {
        foreach ($this->items as $user) {
            if ($user instanceof User && $user->email === $email && password_verify($password, $user->passwordHash)) {
                return $user;
            }
        }

        throw new InvalidArgumentException('Credenciales no validas.');
    }

    public function changeStatus(int $id, string $estado): User
    {
        /** @var User $user */
        $user = $this->requireFound($id);
        $user->estado = User::assertIn($estado, User::STATUSES, 'estado');

        return $user;
    }

    public function findByEmail(string $email): ?User
    {
        foreach ($this->items as $user) {
            if ($user instanceof User && $user->email === $email) {
                return $user;
            }
        }

        return null;
    }
}
