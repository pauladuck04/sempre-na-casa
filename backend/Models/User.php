<?php

declare(strict_types=1);

namespace App\Models;

final class User extends BaseModel
{
    public const ROLES = ['admin', 'anfitrion', 'inquilino'];
    public const STATUSES = ['activo', 'pendiente', 'inactivo'];

    public function __construct(
        ?int $id,
        public string $nombre,
        public string $email,
        public string $passwordHash,
        public string $rol,
        public string $dni,
        public string $telefono,
        public string $estado = 'pendiente',
        public ?string $fechaRegistro = null,
    ) {
        parent::__construct($id);
        self::assertIn($this->rol, self::ROLES, 'rol');
        self::assertIn($this->estado, self::STATUSES, 'estado');
    }

    public static function fromArray(array $data): static
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            self::requireString($data, 'nombre'),
            self::requireString($data, 'email'),
            (string) ($data['password_hash'] ?? $data['passwordHash'] ?? ''),
            self::assertIn((string) ($data['rol'] ?? 'inquilino'), self::ROLES, 'rol'),
            self::requireString($data, 'dni'),
            self::requireString($data, 'telefono'),
            self::assertIn((string) ($data['estado'] ?? 'pendiente'), self::STATUSES, 'estado'),
            (string) ($data['fechaRegistro'] ?? $data['fecha_registro'] ?? date('d/m/Y')),
        );
    }

    public function toArray(): array
    {
        return $this->baseArray() + [
            'nombre' => $this->nombre,
            'email' => $this->email,
            'rol' => $this->rol,
            'dni' => $this->dni,
            'telefono' => $this->telefono,
            'estado' => $this->estado,
            'fechaRegistro' => $this->fechaRegistro,
        ];
    }
}
