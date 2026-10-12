import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, View } from "react-native";

import { formatRating } from "@/lib/format/datetime";
import { colors } from "@/theme";

type StarRatingProps = { value: number; size?: number };

/** Lima bintang read-only, dibulatkan ke bintang utuh (sama dengan StarRating web). */
export function StarRating({ value, size = 16 }: StarRatingProps) {
  const filled = Math.round(value);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Rating ${formatRating(value)} dari 5`}
      style={styles.root}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialCommunityIcons
          key={star}
          name={star <= filled ? "star" : "star-outline"}
          size={size}
          color={star <= filled ? colors.brand : colors.line}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flexDirection: "row", gap: 1 } });
