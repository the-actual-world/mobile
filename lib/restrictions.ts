import { t } from "i18next";
import * as z from "zod";

export const restrictions = {
  name: z.string({
    required_error: t("auth:fieldRequired"),
  }),
  birthDate: z
    .date({
      required_error: t("auth:fieldRequired"),
    })
    .min(
      new Date(Date.now() - 150 * 365 * 24 * 60 * 60 * 1000),
      t("auth:tooOld")
    )
    .max(
      new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000),
      t("auth:tooYoung")
    ),
  email: z
    .string({
      required_error: t("auth:fieldRequired"),
    })
    .email(t("auth:invalidEmail")),
  password: z
    .string({
      required_error: t("auth:fieldRequired"),
    })
    .min(8, t("auth:passwordMin"))
    .max(128, t("auth:passwordMax"))
    .regex(/^(?=.*[a-z])/, t("auth:oneLowercase"))
    .regex(/^(?=.*[A-Z])/, t("auth:oneUppercase"))
    .regex(/^(?=.*[0-9])/, t("auth:oneNumber")),
  confirmPassword: z.string({
    required_error: t("auth:fieldRequired"),
  }),
};