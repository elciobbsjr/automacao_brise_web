"use server";

import {
  revalidatePath,
} from "next/cache";

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
  countActiveAdmins,
  getUserForStatusChange,
  setUserActive,
} from "@/features/users/services/user.service";

export interface ToggleUserStatusActionState {
  success: boolean;

  error:
    | string
    | null;
}

export async function toggleUserStatusAction(
  previousState:
    ToggleUserStatusActionState,
  formData: FormData,
): Promise<ToggleUserStatusActionState> {
  void previousState;

  /*
   * Somente administradores.
   */
  const currentAdmin =
    await requireRole([
      UserRole.ADMIN,
    ]);

  const userIdValue =
    formData.get(
      "userId",
    );

  if (
    typeof userIdValue !==
      "string" ||
    userIdValue
      .trim()
      .length === 0
  ) {
    return {
      success: false,

      error:
        "Usuário inválido.",
    };
  }

  const userId =
    userIdValue.trim();

  const targetUser =
    await getUserForStatusChange(
      userId,
    );

  if (!targetUser) {
    return {
      success: false,

      error:
        "Usuário não encontrado.",
    };
  }

  /*
   * Um administrador não pode
   * desativar a própria conta.
   */
  if (
    targetUser.id ===
      currentAdmin.id &&
    targetUser.active
  ) {
    return {
      success: false,

      error:
        "Você não pode desativar sua própria conta.",
    };
  }

  const nextActive =
    !targetUser.active;

  /*
   * Nunca permitimos desativar
   * o último administrador ativo.
   */
  if (
    !nextActive &&
    targetUser.role ===
      UserRole.ADMIN
  ) {
    const activeAdmins =
      await countActiveAdmins();

    if (
      activeAdmins <= 1
    ) {
      return {
        success: false,

        error:
          "Não é possível desativar o último administrador ativo do sistema.",
      };
    }
  }

  try {
    await setUserActive(
      targetUser.id,
      nextActive,
    );

    /*
     * AUDITORIA
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
          nextActive
            ? "ACTIVATE_USER"
            : "DEACTIVATE_USER",

        resource:
          "USER",

        resourceId:
          targetUser.id,

        description:
          nextActive
            ? `Usuário "${targetUser.name}" reativado.`
            : `Usuário "${targetUser.name}" desativado.`,

        metadata: {
          targetName:
            targetUser.name,

          targetEmail:
            targetUser.email,

          role:
            targetUser.role,

          previousActive:
            targetUser.active,

          newActive:
            nextActive,
        },
      });
    } catch (auditError) {
      console.error(
        "Erro ao registrar auditoria de alteração de status:",
        auditError,
      );
    }

    revalidatePath(
      "/admin/users",
    );

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(
      "Erro ao alterar status do usuário:",
      error,
    );

    return {
      success: false,

      error:
        "Não foi possível alterar o status do usuário.",
    };
  }
}