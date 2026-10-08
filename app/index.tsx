import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { layout, space, type } from "@/theme";

// Sementara sampai layar login dibuat di Tahap 1.
export default function Home() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text style={type.title}>MyGerai</Text>
        <Text style={type.caption}>Layar login menyusul di Tahap 1.</Text>
      </View>
      {__DEV__ ? (
        <Button
          label="Lihat komponen UI"
          variant="secondary"
          fullWidth
          onPress={() => router.push("/dev/komponen")}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: layout.screenPaddingX, paddingBottom: space.lg },
  body: { flex: 1, justifyContent: "center", gap: space.xs },
});
