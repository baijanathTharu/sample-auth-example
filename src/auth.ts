import {
  ILoginHandler,
  ILogoutHandler,
  IRefreshHandler,
  IResetPasswordHandler,
  ISignUpHandler,
  IMeRouteHandler,
  IVerifyEmailHandler,
  INotifyService,
  IForgotPasswordHandler,
  IVerifyOtpHandler,
} from "@baijanstack/express-auth";

import { prisma } from "./prisma-client";

type TEmailObj = {
  email: string;
};

interface TSignUpBodyInput extends TEmailObj {
  name: string;
  password: string;
}

export class SignUpHandler implements ISignUpHandler {
  constructor() {
    console.log("signup Handler init...");
  }

  errors: { USER_ALREADY_EXISTS_MESSAGE?: string } = {};

  doesUserExists: (body: TSignUpBodyInput) => Promise<boolean> = async (
    body
  ) => {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    return !!user;
  };

  saveUser: (body: TSignUpBodyInput, hashedPassword: string) => Promise<void> =
    async (body, hashedPassword) => {
      await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
        },
      });
    };
}

type TLoginOutput = {
  name: string;
  email: string;
  password: string;
};

export class LoginHandler implements ILoginHandler {
  getUserByEmail: (email: string) => Promise<any> = async (email) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
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

    if (!user) {
      throw new Error("User not found");
    }

    return {
      email: user?.email,
      name: user?.name,
    };
  };
}

export class LogoutHandler implements ILogoutHandler {
  shouldLogout: () => Promise<boolean> = async () => {
    return true;
  };
}

type TRefreshOutput = {
  email: string;
  name: string;
};

export class RefreshHandler implements IRefreshHandler {
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

export class ResetPasswordHandler implements IResetPasswordHandler {
  saveHashedPassword: (email: string, hashedPassword: string) => Promise<void> =
    async (email, hashedPassword) => {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          password: hashedPassword,
        },
      });
    };
  getOldPasswordHash: (email: string) => Promise<string> = async (email) => {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new Error(`User not found`);
    }

    return user.password;
  };
}

type TMeOutput = {
  name: string;
  email: string;
};

export class MeRouteHandler implements IMeRouteHandler {
  getMeByEmail: () => Promise<any> = async () => {
    console.log("getting logged in user...");
  };
}

export class VerifyEmailHandler implements IVerifyEmailHandler {
  errors: { EMAIL_NOT_ELIGIBLE_FOR_VERIFICATION?: string } = {
    EMAIL_NOT_ELIGIBLE_FOR_VERIFICATION: "",
  };

  isEmailEligibleForVerification: (email: string) => Promise<boolean> = async (
    email
  ) => {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    console.log("user", user);

    return !user?.is_email_verified;
  };

  sendVerificationEmail: (input: {
    email: string;
    verificationPath: string;
  }) => Promise<void> = async (input) => {
    console.log("sendVerificationEmail Input", input);
  };
}

export class ForgotPasswordHandler implements IForgotPasswordHandler {
  doesUserExists: (email: string) => Promise<boolean> = async (email) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return !!user;
  };
  saveOtp: (
    email: string,
    otp: { code: string; generatedAt: number }
  ) => Promise<void> = async (email, otp) => {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        UserOtp: {
          create: {
            code: otp.code,
            generated_at: new Date(otp.generatedAt * 1000),
            is_used: false,
          },
        },
      },
    });
  };
  sendOtp: (
    email: string,
    otp: { code: string; generatedAt: number }
  ) => Promise<void> = async (email, otp) => {
    console.log("----seind otp", email, otp);
  };
}

export class VerifyOtpHandler implements IVerifyOtpHandler {
  saveNewPassword: (email: string, password: string) => Promise<void> = async (
    email,
    password
  ) => {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password,
      },
    });
  };
  isOtpValid: (email: string, otp: string) => Promise<boolean> = async (
    email,
    otp
  ) => {
    const latestOtp = await prisma.userOtp.findFirst({
      where: {
        user: {
          email,
        },
      },
      orderBy: {
        created: "desc",
      },
    });

    if (!latestOtp) {
      console.error("latestOtp not found");
      return false;
    }

    const isExpired =
      Date.now() > latestOtp.generated_at.getTime() + 5 * 60 * 1000; // 5 minutes

    return latestOtp.code === otp && !latestOtp.is_used && !isExpired;
  };
}

export class EmailNotificationService implements INotifyService {
  async notify(type: "TOKEN_STOLEN", email: string): Promise<void> {
    if (type === "TOKEN_STOLEN") {
      console.log(`Notifying ... ${email}`);
    }
  }
}
