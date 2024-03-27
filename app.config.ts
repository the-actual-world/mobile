import { ConfigContext, ExpoConfig } from "@expo/config";

import * as dotenv from "dotenv";

dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
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
    googleServicesFile: "./google-services.json",
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
      projectId: process.env.EAS_PROJECT_ID,
      oneSignalAppId: process.env.ONESIGNAL_APP_ID,
    },
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  runtimeVersion: {
    policy: "sdkVersion",
  },
  updates: {
    url: "https://u.expo.dev/" + process.env.EAS_PROJECT_ID,
  },
});
