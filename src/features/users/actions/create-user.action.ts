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
   * Segurança real no servidor.
   *
   * Mesmo que alguém tente chamar
   * esta action manualmente,
   * somente ADMIN poderá continuar.
   */
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

  /*
   * Não permitimos dois usuários
   * com o mesmo e-mail.
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
    const passwordHash =
      await hashPassword(
        parsed.data.password,
      );

    await createUser({
      name,
      email,
      passwordHash,

      role:
        parsed.data
          .role as UserRole,
    });

    /*
     * Atualiza os dados exibidos
     * na área administrativa.
     */
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