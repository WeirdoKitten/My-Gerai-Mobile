import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { EmptyState, ScreenHeader } from "@/components/ui";
import { Screen } from "@/components/ui/Screen";

type ComingSoonProps = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  feature: string;
  /** Lanjutan kalimat "buka dashboard MyGerai di browser untuk ...". */
  webTask: string;
};

/** Tab yang fiturnya belum ada di aplikasi (Item: Tahap 3, Laporan: Tahap 4). */
export function ComingSoon({ title, icon, feature, webTask }: ComingSoonProps) {
  return (
    <Screen header={<ScreenHeader title={title} />}>
      <EmptyState
        icon={icon}
        title={`${feature} segera hadir di aplikasi`}
        description={`Untuk sementara, buka dashboard MyGerai di browser untuk ${webTask}.`}
      />
    </Screen>
  );
}
