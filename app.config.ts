import { ConfigContext, ExpoConfig } from "@expo/config";
// import path from "path";
// import * as dotenv from "dotenv";

// dotenv.config({
//   path: [
//     path.resolve(__dirname, ".env"),
//     path.resolve(__dirname, ".env.local"),
//   ],
// });

export default ({ config }: ConfigContext): ExpoConfig => {
  if (!process.env.ANDROID_GOOGLE_SERVICES_FILE_PATH) {
    console.warn(
      "ANDROID_GOOGLE_SERVICES_FILE_PATH is not defined, using default value",
    );
  }
  if (!process.env.EXPO_PUBLIC_EAS_PROJECT_ID) {
    console.warn(
      "EXPO_PUBLIC_EAS_PROJECT_ID is not defined, using default value",
    );
  }
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
    console.warn(
      "EXPO_PUBLIC_SUPABASE_URL is not defined, using default value",
    );
  }
  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      "EXPO_PUBLIC_SUPABASE_ANON_KEY is not defined, using default value",
    );
  }
  if (!process.env.GOOGLE_IOS_URL_SCHEME) {
    console.warn("GOOGLE_IOS_URL_SCHEME is not defined, using default value");
  }
  if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
    console.warn(
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not defined, using default value",
    );
  }
  if (!process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn(
      "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined, using default value",
    );
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY is not defined, using default value");
  }

  return {
    name: "The Actual World",
    slug: "TheActualWorld",
    scheme: "world.theactual",
    version: "1.0.4",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#097E67",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.kraktoos.TheActualWorld",
      infoPlist: {
        NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access camera.",
        NSMicrophoneUsageDescription:
          "Allow $(PRODUCT_NAME) to access your microphone",
      },
    },
    android: {
      package: "com.kraktoos.TheActualWorld",
      softwareKeyboardLayoutMode: "pan",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
      googleServicesFile: process.env.ANDROID_GOOGLE_SERVICES_FILE_PATH ??
        "./google-services.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      [
        "expo-dynamic-app-icon",
        {
          "default_": {
            "image": "./assets/images/icon.png",
            "prerendered": true,
          },
          "light": {
            "image": "./assets/images/icon-light.png",
            "prerendered": true,
          },
        },
      ],
      [
        "@stripe/stripe-react-native",
        {
          "enableGooglePay": true,
        },
      ],
      "expo-localization",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera.",
        },
      ],
      [
        "expo-barcode-scanner",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access camera.",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.",
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME,
        },
      ],
      "expo-router",
    ],
    extra: {
      eas: {
        projectId: "7b0aab74-481a-4aef-919d-0080991f00d0",
      },
    },
    runtimeVersion: {
      policy: "sdkVersion",
    },
    updates: {
      url: "https://u.expo.dev/" + process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  };
};
