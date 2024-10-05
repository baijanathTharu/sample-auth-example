import { config } from "dotenv";

config({
  path: ".env",
});

import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";

import { RouteGenerator, TConfig } from "@baijanstack/express-auth";
import {
  EmailNotificationService,
  ForgotPasswordPersistor,
  LoginPersistor,
  LogoutPersistor,
  MeRoutePersistor,
  RefreshPersistor,
  ResetPasswordPersistor,
  SignUpPersistor,
  VerifyEmailPersistor,
  VerifyOtpPersistor,
} from "./auth";

const PORT = 4000;

const authConfig: TConfig = {
  BASE_PATH: "/v1/auth",
  SALT_ROUNDS: 10,
  TOKEN_SECRET: "random_secure_secret_value",
  ACCESS_TOKEN_AGE: 60000, // 1 minute
  REFRESH_TOKEN_AGE: 240000, // 4 minutes
  EMAIL_VERIFICATION_TOKEN_AGE: 300000, // 5 minutes
};

const notificationService = new EmailNotificationService();

async function main() {
  const app = express();

  app.use(express.json());

  app.use(cookieParser());

  app.get("/ping", (req, res) => {
    res.send("hello from server");
  });

  const routeGenerator = new RouteGenerator(
    app,
    notificationService,
    authConfig
  );

  // sign up route
  const signUpPersistor = new SignUpPersistor();
  routeGenerator.createSignUpRoute(signUpPersistor);

  // login route
  const loginPersistor = new LoginPersistor();
  routeGenerator.createLoginRoute(loginPersistor);

  // logout route
  const logoutPersistor = new LogoutPersistor();
  routeGenerator.createLogoutRoute(logoutPersistor);

  // refresh route
  const refreshPersistor = new RefreshPersistor();
  routeGenerator.createRefreshRoute(refreshPersistor);

  // reset password route
  const resetPasswordPersistor = new ResetPasswordPersistor();
  routeGenerator.createResetPasswordRoute(resetPasswordPersistor);

  // me route
  const meRoutePersistor = new MeRoutePersistor();
  routeGenerator.createMeRoute(meRoutePersistor);

  // verify email route
  const verifyEmailPersistor = new VerifyEmailPersistor();
  routeGenerator.createVerifyEmailRoute(verifyEmailPersistor);

  // forgot password route
  const forgotPasswordPersistor = new ForgotPasswordPersistor();
  routeGenerator.createForgotPasswordRoute(forgotPasswordPersistor);

  // verify otp route
  const verifyOtpPersistor = new VerifyOtpPersistor();
  routeGenerator.createVerifyOtpRoute(verifyOtpPersistor);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("final error");
    res.status(500).json({
      message: err.message,
    });
  });

  app.listen(PORT, () => {
    console.log(`Started on ${PORT}`);
  });
}

main()
  .then(() => {
    console.log("init");
  })
  .catch((e) => {
    console.error(e);
  });
