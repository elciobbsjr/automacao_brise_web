import NextAuth from "next-auth";

import Credentials from "next-auth/providers/credentials";

import {
  prisma,
} from "@/lib/prisma";

import {
  verifyPassword,
} from "@/lib/password";

import {
  UserRole,
} from "@/generated/prisma/client";

import {
  loginSchema,
} from "@/features/auth/schemas/login.schema";

/*
 * Confirma que o valor armazenado
 * no JWT corresponde a um perfil
 * válido do sistema.
 */
function isUserRole(
  value: unknown,
): value is UserRole {
  return (
    value === UserRole.VIEWER ||
    value === UserRole.OPERATOR ||
    value === UserRole.ADMIN
  );
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret:
    process.env.AUTH_SECRET,

  /*
   * Quando o Auth.js precisar
   * solicitar autenticação,
   * utilizará nossa página própria.
   */
  pages: {
    signIn:
      "/login",
  },

  session: {
    strategy:
      "jwt",
  },

  providers: [
    Credentials({
      name:
        "E-mail e senha",

      credentials: {
        email: {
          label:
            "E-mail",

          type:
            "email",
        },

        password: {
          label:
            "Senha",

          type:
            "password",
        },
      },

      async authorize(
        credentials,
      ) {
        const parsed =
          loginSchema.safeParse(
            credentials,
          );

        if (!parsed.success) {
          return null;
        }

        const email =
          parsed.data.email
            .trim()
            .toLowerCase();

        const password =
          parsed.data.password;

        const user =
          await prisma.user.findUnique({
            where: {
              email,
            },
          });

        /*
         * Não revelamos se o usuário
         * não existe ou está inativo.
         */
        if (
          !user ||
          !user.active
        ) {
          return null;
        }

        const passwordIsValid =
          await verifyPassword(
            password,
            user.passwordHash,
          );

        if (!passwordIsValid) {
          return null;
        }

        /*
         * Somente informações seguras
         * são enviadas para a sessão.
         */
        return {
          id:
            user.id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }) {
      if (user) {
        if (
          typeof user.id ===
          "string"
        ) {
          token.id =
            user.id;
        }

        if (
          isUserRole(
            user.role,
          )
        ) {
          token.role =
            user.role;
        }
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (
        session.user &&
        typeof token.id ===
          "string"
      ) {
        session.user.id =
          token.id;
      }

      if (
        session.user &&
        isUserRole(
          token.role,
        )
      ) {
        session.user.role =
          token.role;
      }

      return session;
    },
  },
});