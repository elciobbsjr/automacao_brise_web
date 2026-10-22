import {
  z,
} from "zod";

export const createUserSchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Informe o nome do usuário.",
        )
        .max(
          100,
          "O nome é muito longo.",
        ),

    email:
      z
        .string()
        .trim()
        .email(
          "Informe um e-mail válido.",
        )
        .max(
          150,
          "O e-mail é muito longo.",
        ),

    password:
      z
        .string()
        .min(
          12,
          "A senha deve possuir pelo menos 12 caracteres.",
        )
        .max(
          128,
          "A senha é muito longa.",
        ),

    role:
      z.enum([
        "VIEWER",
        "OPERATOR",
        "ADMIN",
      ]),
  });

export type CreateUserInput =
  z.infer<
    typeof createUserSchema
  >;