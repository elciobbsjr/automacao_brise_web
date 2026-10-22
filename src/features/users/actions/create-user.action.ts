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
  hashPassword,
} from "@/lib/password";

import {
  createUserSchema,
} from "@/features/users/schemas/create-user.schema";

import {
  createUser,
  findUserByEmail,
} from "@/features/users/services/user.service";

import {
  createAuditLog,
} from "@/features/audit/services/audit.service";

export interface CreateUserActionState {
  success: boolean;

  error:
    | string
    | null;

  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };
}

export async function createUserAction(
  previousState:
    CreateUserActionState,
  formData: FormData,
): Promise<CreateUserActionState> {
  void previousState;

  /*
   * Apenas ADMIN pode criar usuários.
   *
   * Também guardamos os dados do
   * administrador responsável para
   * registrar a auditoria.
   */
  const currentAdmin =
    await requireRole([
      UserRole.ADMIN,
    ]);

  const rawData = {
    name:
      formData.get(
        "name",
      ),

    email:
      formData.get(
        "email",
      ),

    password:
      formData.get(
        "password",
      ),

    role:
      formData.get(
        "role",
      ),
  };

  const parsed =
    createUserSchema.safeParse(
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

        password:
          flattened
            .fieldErrors
            .password?.[0],

        role:
          flattened
            .fieldErrors
            .role?.[0],
      },
    };
  }

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
   * E-mail único.
   */
  const existingUser =
    await findUserByEmail(
      email,
    );

  if (existingUser) {
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

  try {
    /*
     * A senha nunca é armazenada
     * em texto puro.
     */
    const passwordHash =
      await hashPassword(
        parsed.data.password,
      );

    const createdUser =
      await createUser({
        name,
        email,
        passwordHash,
        role,
      });

    /*
     * AUDITORIA
     *
     * Não registramos senha nem hash.
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
          "CREATE_USER",

        resource:
          "USER",

        resourceId:
          createdUser.id,

        description:
          `Usuário "${createdUser.name}" criado com perfil ${createdUser.role}.`,

        metadata: {
          targetName:
            createdUser.name,

          targetEmail:
            createdUser.email,

          role:
            createdUser.role,
        },
      });
    } catch (auditError) {
      /*
       * Uma falha específica na auditoria
       * não desfaz um usuário que já foi
       * criado com sucesso.
       *
       * Posteriormente podemos tornar
       * operações críticas transacionais.
       */
      console.error(
        "Erro ao registrar auditoria de criação de usuário:",
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
      "Erro ao criar usuário:",
      error,
    );

    return {
      success: false,

      error:
        "Não foi possível criar o usuário. Tente novamente.",
    };
  }
}