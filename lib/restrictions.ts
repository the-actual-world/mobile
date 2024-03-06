import * as z from "zod";

// Define a mapping interface from type to Zod schema type
interface RestrictionsMap {
  name: z.ZodString;
  birthDate: z.ZodDate;
  email: z.ZodString;
  password: z.ZodString;
  confirmPassword: z.ZodString;
}

// Utility function to create a Zod string schema with a common required error message
function createStringSchema(
  t: (key: string) => string,
  additionalRules?: (schema: z.ZodString) => z.ZodString
): z.ZodString {
  let schema = z.string({ required_error: t("auth:fieldRequired") });
  if (additionalRules) {
    schema = additionalRules(schema);
  }
  return schema;
}

export function createFieldSchema<T extends keyof RestrictionsMap>(
  t: (key: string) => string,
  type: T
): RestrictionsMap[T] {
  switch (type) {
    case "name":
      return createStringSchema(t) as RestrictionsMap[T];
    case "birthDate":
      return z
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
        ) as RestrictionsMap[T];
    case "email":
      return createStringSchema(t, (schema) =>
        schema.email(t("auth:invalidEmail"))
      ) as RestrictionsMap[T];
    case "password":
      return createStringSchema(t, (schema) =>
        schema
          .min(8, t("auth:passwordMin"))
          .max(128, t("auth:passwordMax"))
          .regex(/^(?=.*[a-z])/, t("auth:oneLowercase"))
          .regex(/^(?=.*[A-Z])/, t("auth:oneUppercase"))
          .regex(/^(?=.*[0-9])/, t("auth:oneNumber"))
      ) as RestrictionsMap[T];
    case "confirmPassword":
      return createStringSchema(t) as RestrictionsMap[T];
    default:
      throw new Error("Unknown field type");
  }
}
