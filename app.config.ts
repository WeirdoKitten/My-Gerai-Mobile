import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MyGerai",
  slug: "my-gerai",
  owner: "satriapss-team",
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
    "expo-secure-store",
    "expo-image",
    "@react-native-community/datetimepicker",
    [
      "expo-image-picker",
      {
        photosPermission: "MyGerai butuh akses galeri untuk memilih foto Item dan Lapak.",
        cameraPermission: "MyGerai butuh akses kamera untuk memotret Item dan Lapak.",
        microphonePermission: false,
      },
    ],
    [
      // Lokasi hanya saat Pedagang menekan "Pakai lokasi saya" di Ubah Profil; tanpa lokasi latar belakang.
      "expo-location",
      {
        locationWhenInUsePermission: "MyGerai butuh lokasi untuk memasang titik Lapak di peta.",
        isAndroidBackgroundLocationEnabled: false,
        isAndroidForegroundServiceEnabled: false,
      },
    ],
    [
      // Hanya menyimpan gambar QR (QR Menu, QR tagihan) ke galeri; tidak membaca media lain.
      "expo-media-library",
      {
        savePhotosPermission: "MyGerai butuh akses galeri untuk menyimpan gambar QR.",
        isAccessMediaLocationEnabled: false,
        granularPermissions: ["photo"],
      },
    ],
    "expo-sharing",
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
  extra: {
    eas: { projectId: "346753b3-df0a-48e6-87b7-c0712c246fa3" },
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
