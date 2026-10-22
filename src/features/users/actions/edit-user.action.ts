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
   */
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
   * E-mail deve continuar único.
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
    await updateUser(
      targetUser.id,
      {
        name,
        email,
        role,
      },
    );

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