import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { assetUrl } from "@/api/asset-url";
import { colors, radius } from "@/theme";

type PhotoThumbProps = {
  /** Path dari server (`/uploads/...`) atau URI lokal (`file://...`) sebelum diunggah. */
  src: string | null;
  size?: number;
  dimmed?: boolean;
};

export function PhotoThumb({ src, size = 64, dimmed = false }: PhotoThumbProps) {
  const box = { width: size, height: size, borderRadius: radius.control };
  if (!src) {
    return (
      <View style={[styles.placeholder, box]}>
        <MaterialCommunityIcons
          name="image-off-outline"
          size={Math.round(size * 0.38)}
          color={colors.brandStrong}
        />
      </View>
    );
  }
  return (
    <Image
      source={{ uri: src.startsWith("/") ? assetUrl(src) : src }}
      style={[box, dimmed && styles.dimmed]}
      contentFit="cover"
      transition={120}
      cachePolicy="disk"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
  },
  dimmed: { opacity: 0.45 },
});
