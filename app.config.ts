import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MyGerai",
  slug: "mygerai-pedagang",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "mygerai",
  userInterfaceStyle: "light",
  backgroundColor: "#FAF6F1",
  platforms: ["android"],
  android: {
    package: "com.mygerai.pedagang",
    adaptiveIcon: {
      backgroundColor: "#FFF1E7",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-status-bar",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FAF6F1",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],
    [
      "expo-build-properties",
      {
        // Wajib Play Store sejak 31 Agustus 2026. Default RN 0.86 sudah 36; dikunci di sini supaya tidak turun diam-diam.
        android: { targetSdkVersion: 36, compileSdkVersion: 36 },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
