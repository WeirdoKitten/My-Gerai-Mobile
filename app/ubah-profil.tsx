import { StyleSheet, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import { Alert, Button, Spinner, SubScreen } from "@/components/ui";
import { ProfileForm } from "@/features/profile/ProfileForm";
import { useProfile } from "@/features/profile/use-profile";
import { colors, layout, space } from "@/theme";

export default function EditProfileScreen() {
  const profile = useProfile();

  // Form dibuat sekali dari data server; refetch sesudah simpan tidak membuat ulang form.
  if (profile.data) return <ProfileForm profile={profile.data} />;

  return (
    <SubScreen title="Ubah Profil">
      {profile.error ? (
        <View style={styles.pad}>
          <Alert tone="error" message={errorMessage(profile.error)} />
          <Button label="Coba lagi" variant="secondary" onPress={() => profile.refetch()} />
        </View>
      ) : (
        <View style={styles.center}>
          <Spinner size="large" />
        </View>
      )}
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  pad: { padding: layout.screenPaddingX, gap: space.md },
});
