<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PasswordResetToken;
use DateTimeImmutable;
use InvalidArgumentException;

final class PasswordResetService extends BaseService
{
    public function createToken(int $usuarioId, int $minutesToLive = 30): array
    {
        $plainToken = bin2hex(random_bytes(32));
        $expiresAt = (new DateTimeImmutable("+{$minutesToLive} minutes"))->format(DATE_ATOM);

        $token = PasswordResetToken::fromArray([
            'usuario_id' => $usuarioId,
            'token_hash' => password_hash($plainToken, PASSWORD_DEFAULT),
            'expires_at' => $expiresAt,
        ]);

        $this->save($token);

        return [
            'token' => $plainToken,
            'expires_at' => $expiresAt,
        ];
    }

    public function consume(int $usuarioId, string $plainToken): PasswordResetToken
    {
        $now = new DateTimeImmutable();

        foreach ($this->items as $token) {
            if (!$token instanceof PasswordResetToken) {
                continue;
            }

            if (
                $token->usuarioId === $usuarioId
                && $token->usedAt === null
                && new DateTimeImmutable($token->expiresAt) > $now
                && password_verify($plainToken, $token->tokenHash)
            ) {
                $token->usedAt = $now->format(DATE_ATOM);

                return $token;
            }
        }

        throw new InvalidArgumentException('Token de recuperacion no valido.');
    }
}
