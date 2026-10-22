"use server";

import {
  UserRole,
} from "@/generated/prisma/client";

import {
  requireRole,
} from "@/features/auth/guards/require-role";

import {
  hashPassword,
} from "@/lib/password";

import {
  resetUserPasswordSchema,
} from "@/features/users/schemas/reset-user-password.schema";

import {
  getUserForAdministration,
  updateUserPassword,
} from "@/features/users/services/user.service";

export interface ResetUserPasswordActionState {
  success: boolean;

  error:
    | string
    | null;

  fieldErrors?: {
    password?: string;
    confirmPassword?: string;
  };
}

export async function resetUserPasswordAction(
  previousState:
    ResetUserPasswordActionState,
  formData: FormData,
): Promise<ResetUserPasswordActionState> {
  void previousState;

  /*
   * Apenas administradores podem
   * redefinir senhas de usuários.
   */
  await requireRole([
    UserRole.ADMIN,
  ]);

  const rawData = {
    userId:
      formData.get(
        "userId",
      ),

    password:
      formData.get(
        "password",
      ),

    confirmPassword:
      formData.get(
        "confirmPassword",
      ),
  };

  /*
   * Validação dos dados enviados
   * pelo formulário.
   */
  const parsed =
    resetUserPasswordSchema.safeParse(
      rawData,
    );

  if (!parsed.success) {
    const flattened =
      parsed.error.flatten();

    return {
      success: false,

      error:
        "Verifique os dados informados.",

      fieldErrors: {
        password:
          flattened
            .fieldErrors
            .password?.[0],

        confirmPassword:
          flattened
            .fieldErrors
            .confirmPassword?.[0],
      },
    };
  }

  /*
   * Confirma que o usuário
   * ainda existe no banco.
   */
  const targetUser =
    await getUserForAdministration(
      parsed.data.userId,
    );

  if (!targetUser) {
    return {
      success: false,

      error:
        "Usuário não encontrado.",
    };
  }

  try {
    /*
     * Nunca armazenamos a senha
     * em texto puro.
     *
     * Utilizamos o mesmo mecanismo
     * de hash já usado no login e
     * na criação de usuários.
     */
    const passwordHash =
      await hashPassword(
        parsed.data.password,
      );

    await updateUserPassword(
      targetUser.id,
      passwordHash,
    );

    return {
      success: true,

      error: null,
    };
  } catch (error) {
    console.error(
      "Erro ao redefinir senha:",
      error,
    );

    return {
      success: false,

      error:
        "Não foi possível redefinir a senha.",
    };
  }
}