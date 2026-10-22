import {
  z,
} from "zod";

export const resetUserPasswordSchema =
  z
    .object({
      userId:
        z
          .string()
          .trim()
          .min(
            1,
            "Usuário inválido.",
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

      confirmPassword:
        z
          .string()
          .min(
            1,
            "Confirme a nova senha.",
          ),
    })
    .refine(
      (data) =>
        data.password ===
        data.confirmPassword,
      {
        message:
          "As senhas não coincidem.",

        path: [
          "confirmPassword",
        ],
      },
    );