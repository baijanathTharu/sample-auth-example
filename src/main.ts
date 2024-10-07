import { config } from "dotenv";

config({
  path: ".env",
});

import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";

import { initAuth, RouteGenerator, TConfig } from "@baijanstack/express-auth";
import {
  EmailNotificationService,
  ForgotPasswordHandler,
  LoginHandler,
  LogoutHandler,
  MeRouteHandler,
  RefreshHandler,
  ResetPasswordHandler,
  SignUpHandler,
  VerifyEmailHandler,
  VerifyOtpHandler,
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

  initAuth({
    routeGenerator,
    signUpHandler: new SignUpHandler(),
    loginHandler: new LoginHandler(),
    logoutHandler: new LogoutHandler(),
    refreshHandler: new RefreshHandler(),
    resetPasswordHandler: new ResetPasswordHandler(),
    meRouteHandler: new MeRouteHandler(),
    verifyEmailHandler: new VerifyEmailHandler(),
    forgotPasswordHandler: new ForgotPasswordHandler(),
    verifyOtpHandler: new VerifyOtpHandler(),
  });

  app.get("/authed-ping", routeGenerator.validateAccessToken, (req, res) => {
    res.send("hello from server");
  });

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
