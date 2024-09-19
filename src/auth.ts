import {
  ILoginPersistor,
  ILogoutPersistor,
  IRefreshPersistor,
  IResetPasswordPersistor,
  ISignUpPersistor,
  IMeRoutePersistor,
} from "@baijanstack/express-auth";
import { User } from "@prisma/client";

import { prisma } from "./prisma-client";

export class SignUpPersistor implements ISignUpPersistor {
  constructor() {
    console.log("signup persistor init...");
  }

  errors: { USER_ALREADY_EXISTS_MESSAGE?: string } = {};

  doesUserExists: (body: Omit<User, "id">) => Promise<boolean> = async (
    body
  ) => {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    return !!user;
  };

  saveUser: (body: Omit<User, "id">, hashedPassword: string) => Promise<void> =
    async (body, hashedPassword) => {
      console.log("saving user...", body, hashedPassword);
      await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
        },
      });
    };
}

export class LoginPersistor implements ILoginPersistor {
  getUserByEmail: (email: string) => Promise<any> = async (email) => {
    console.log("getUserByEmail", email);
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    console.log("getUserByEmail", user);
    return user;
  };
  errors: { PASSWORD_OR_EMAIL_INCORRECT?: string } = {
    PASSWORD_OR_EMAIL_INCORRECT: "Password or email incorrect",
  };
  login: () => Promise<void> = async () => {
    console.log("logged in successfully!!");
  };

  getTokenPayload: (email: string) => Promise<{
    name: string;
    email: string;
  }> = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("getTokenPayload", user);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      email: user?.email,
      name: user?.name,
    };
  };
}

export class LogoutPersistor implements ILogoutPersistor {
  // !FIXME: when it is done in the libary
  revokeTokens: () => Promise<boolean> = async () => {
    console.log("code to revoke token");
    return true;
  };
}

export class RefreshPersistor implements IRefreshPersistor {
  errors: { INVALID_REFRESH_TOKEN?: string } = {};

  refresh: (token: string) => Promise<void> = async () => {
    console.log("refreshing token...");
  };

  getTokenPayload: (email: string) => Promise<any> = async (email) => {
    console.log("getTokenPayload", email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      email: user?.email,
      name: user?.name,
    };
  };

  // !FIXME: token revocation feature
  isTokenEligibleForRefresh: (token: string) => Promise<boolean> = async () => {
    return true;
  };
}

export class ResetPasswordPersistor implements IResetPasswordPersistor {
  saveHashedPassword: (hashedPassword: string) => Promise<void> = async () => {
    console.log("saving hashed password");
  };
  getOldPasswordHash: () => Promise<string> = async () => {
    return "test";
  };
}

export class MeRoutePersistor implements IMeRoutePersistor {
  getMeByUserId: () => Promise<any> = async () => {
    console.log("getting logged in user...");
  };
}
