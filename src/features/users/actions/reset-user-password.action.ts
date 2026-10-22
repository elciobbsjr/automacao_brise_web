"use server";

import {
  UserRole,
} from "@/generated/prisma/client";

import {
  requireRole,
} from "@/features/auth/guards/require-role";

import {
  createAuditLog,
} from "@/features/audit/services/audit.service";

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
   * redefinir senhas.
   *
   * Também guardamos os dados de
   * quem realizou a ação para
   * registrar na auditoria.
   */
  const currentAdmin =
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
   * Validação.
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
   * ainda existe.
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
     * Gera o hash da nova senha.
     *
     * A senha em texto puro nunca
     * é persistida.
     */
    const passwordHash =
      await hashPassword(
        parsed.data.password,
      );

    await updateUserPassword(
      targetUser.id,
      passwordHash,
    );

    /*
     * AUDITORIA
     *
     * Nunca registramos:
     *
     * - senha nova;
     * - senha antiga;
     * - hash;
     * - confirmação da senha.
     */
    try {
      await createAuditLog({
        actor: {
          id:
            currentAdmin.id,

          name:
            currentAdmin.name,

          email:
            currentAdmin.email,
        },

        action:
          "RESET_USER_PASSWORD",

        resource:
          "USER",

        resourceId:
          targetUser.id,

        description:
          `Senha do usuário "${targetUser.name}" redefinida.`,

        metadata: {
          targetName:
            targetUser.name,

          targetEmail:
            targetUser.email,
        },
      });
    } catch (auditError) {
      /*
       * Se houver falha na auditoria,
       * não desfazemos a alteração
       * da senha já realizada.
       */
      console.error(
        "Erro ao registrar auditoria de redefinição de senha:",
        auditError,
      );
    }

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