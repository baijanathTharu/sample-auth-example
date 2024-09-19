import { config } from "dotenv";

config({
  path: ".env",
});

import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";

import { RouteGenerator, TConfig } from "@baijanstack/express-auth";
import {
  LoginPersistor,
  LogoutPersistor,
  MeRoutePersistor,
  RefreshPersistor,
  ResetPasswordPersistor,
  SignUpPersistor,
} from "./auth";

const authConfig: TConfig = {
  SALT_ROUNDS: Number(process.env.SALT_ROUNDS) || 10,
  TOKEN_SECRET: process.env.TOKEN_SECRET || "test",
  ACCESS_TOKEN_AGE: process.env.ACCESS_TOKEN_AGE || "3600",
  REFRESH_TOKEN_AGE: process.env.REFRESH_TOKEN_AGE || "3600",
  ACCESS_TOKEN_COOKIE_MAX_AGE:
    Number(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE) || 60,
  REFRESH_TOKEN_COOKIE_MAX_AGE:
    Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE) || 3600,
};

const PORT = 4000;

async function main() {
  const app = express();

  app.use(express.json());

  app.use(cookieParser());

  app.get("/ping", (req, res) => {
    res.send("hello from server");
  });

  const routeGenerator = new RouteGenerator(app);

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

  const meRoutePersistor = new MeRoutePersistor();
  routeGenerator.createMeRoute(meRoutePersistor);

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
