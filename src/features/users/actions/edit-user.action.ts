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
  editUserSchema,
} from "@/features/users/schemas/edit-user.schema";

import {
  countActiveAdmins,
  findUserByEmail,
  getUserForAdministration,
  updateUser,
} from "@/features/users/services/user.service";

export interface EditUserActionState {
  success: boolean;

  error:
    | string
    | null;

  fieldErrors?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export async function editUserAction(
  previousState:
    EditUserActionState,
  formData: FormData,
): Promise<EditUserActionState> {
  void previousState;

  /*
   * Apenas administradores.
   *
   * Guardamos também os dados
   * do responsável pela alteração
   * para registrar na auditoria.
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

    name:
      formData.get(
        "name",
      ),

    email:
      formData.get(
        "email",
      ),

    role:
      formData.get(
        "role",
      ),
  };

  const parsed =
    editUserSchema.safeParse(
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
        name:
          flattened
            .fieldErrors
            .name?.[0],

        email:
          flattened
            .fieldErrors
            .email?.[0],

        role:
          flattened
            .fieldErrors
            .role?.[0],
      },
    };
  }

  const userId =
    parsed.data.userId;

  const name =
    parsed.data.name.trim();

  const email =
    parsed.data.email
      .trim()
      .toLowerCase();

  const role =
    parsed.data
      .role as UserRole;

  /*
   * Buscamos o estado atual do
   * usuário antes da alteração.
   *
   * Esses valores também serão
   * utilizados na auditoria.
   */
  const targetUser =
    await getUserForAdministration(
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
   * O e-mail precisa continuar único.
   */
  const existingUser =
    await findUserByEmail(
      email,
    );

  if (
    existingUser &&
    existingUser.id !==
      targetUser.id
  ) {
    return {
      success: false,

      error:
        "Já existe um usuário cadastrado com este e-mail.",

      fieldErrors: {
        email:
          "Este e-mail já está em uso.",
      },
    };
  }

  /*
   * Um administrador ativo não pode
   * perder o perfil ADMIN caso seja
   * o último administrador ativo.
   */
  if (
    targetUser.active &&
    targetUser.role ===
      UserRole.ADMIN &&
    role !==
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
          "Não é possível alterar o perfil do último administrador ativo.",
      };
    }
  }

  try {
    /*
     * Guarda os valores anteriores
     * para comparação na auditoria.
     */
    const previousData = {
      name:
        targetUser.name,

      email:
        targetUser.email,

      role:
        targetUser.role,
    };

    const updatedUser =
      await updateUser(
        targetUser.id,
        {
          name,
          email,
          role,
        },
      );

    /*
     * Identifica quais campos
     * realmente foram alterados.
     */
    const changes:
      Record<
        string,
        {
          from: string;
          to: string;
        }
      > = {};

    if (
      previousData.name !==
      updatedUser.name
    ) {
      changes.name = {
        from:
          previousData.name,

        to:
          updatedUser.name,
      };
    }

    if (
      previousData.email !==
      updatedUser.email
    ) {
      changes.email = {
        from:
          previousData.email,

        to:
          updatedUser.email,
      };
    }

    if (
      previousData.role !==
      updatedUser.role
    ) {
      changes.role = {
        from:
          previousData.role,

        to:
          updatedUser.role,
      };
    }

    /*
     * AUDITORIA
     *
     * Registramos apenas se houve
     * alguma alteração efetiva.
     */
    if (
      Object.keys(
        changes,
      ).length > 0
    ) {
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
            "UPDATE_USER",

          resource:
            "USER",

          resourceId:
            updatedUser.id,

          description:
            `Usuário "${updatedUser.name}" atualizado.`,

          metadata: {
            targetName:
              updatedUser.name,

            targetEmail:
              updatedUser.email,

            changes,
          },
        });
      } catch (auditError) {
        /*
         * A edição do usuário não deve
         * falhar apenas porque houve
         * problema ao gravar auditoria.
         */
        console.error(
          "Erro ao registrar auditoria de edição de usuário:",
          auditError,
        );
      }
    }

    revalidatePath(
      "/admin/users",
    );

    revalidatePath(
      "/",
    );

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(
      "Erro ao editar usuário:",
      error,
    );

    return {
      success: false,

      error:
        "Não foi possível atualizar o usuário.",
    };
  }
}