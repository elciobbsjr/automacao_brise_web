import {
  z,
} from "zod";

export const editUserSchema =
  z.object({
    userId:
      z
        .string()
        .trim()
        .min(
          1,
          "Usuário inválido.",
        ),

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

    role:
      z.enum([
        "VIEWER",
        "OPERATOR",
        "ADMIN",
      ]),
  });