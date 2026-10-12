import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button, Input } from "@/components/ui";
import { colors, radius, space, touch, type } from "@/theme";

import { newDraftKey, type VariantGroupDraft, type VariantOptionDraft } from "./product-form";

const MAX_GROUPS = 10;
const MAX_OPTIONS = 20;

type VariantEditorProps = {
  groups: VariantGroupDraft[];
  onChange: (groups: VariantGroupDraft[]) => void;
};

const blankOption = (): VariantOptionDraft => ({ key: newDraftKey(), name: "", priceDelta: "" });

export function VariantEditor({ groups, onChange }: VariantEditorProps) {
  const updateGroup = (key: string, patch: Partial<VariantGroupDraft>) =>
    onChange(groups.map((g) => (g.key === key ? { ...g, ...patch } : g)));

  return (
    <View style={styles.root}>
      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <View style={styles.groupHead}>
            <View style={styles.flex}>
              <Input
                value={group.name}
                onChangeText={(name) => updateGroup(group.key, { name })}
                placeholder="Nama grup, mis. Level Pedas"
                maxLength={50}
                accessibilityLabel="Nama grup varian"
              />
            </View>
            <IconButton
              icon="trash-can-outline"
              label={`Hapus grup ${group.name || "varian"}`}
              onPress={() => onChange(groups.filter((g) => g.key !== group.key))}
            />
          </View>

          {group.options.map((option) => (
            <View key={option.key} style={styles.optionRow}>
              <View style={styles.flex}>
                <Input
                  value={option.name}
                  onChangeText={(name) =>
                    updateGroup(group.key, {
                      options: group.options.map((o) =>
                        o.key === option.key ? { ...o, name } : o,
                      ),
                    })
                  }
                  placeholder="Pilihan, mis. Sedang"
                  maxLength={50}
                  accessibilityLabel="Nama pilihan"
                />
              </View>
              <View style={styles.delta}>
                <Input
                  value={option.priceDelta}
                  onChangeText={(text) =>
                    updateGroup(group.key, {
                      options: group.options.map((o) =>
                        o.key === option.key
                          ? { ...o, priceDelta: text.replace(/[^\d-]/g, "").replace(/(?!^)-/g, "") }
                          : o,
                      ),
                    })
                  }
                  placeholder="+Rp0"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  accessibilityLabel="Selisih harga pilihan"
                />
              </View>
              <IconButton
                icon="close"
                label={`Hapus pilihan ${option.name || ""}`}
                disabled={group.options.length <= 1}
                onPress={() =>
                  updateGroup(group.key, {
                    options: group.options.filter((o) => o.key !== option.key),
                  })
                }
              />
            </View>
          ))}

          {group.options.length < MAX_OPTIONS ? (
            <Button
              label="Tambah pilihan"
              variant="ghost"
              onPress={() => updateGroup(group.key, { options: [...group.options, blankOption()] })}
            />
          ) : null}
        </View>
      ))}

      {groups.length < MAX_GROUPS ? (
        <Button
          label="Tambah grup varian"
          variant="secondary"
          fullWidth
          icon={<MaterialCommunityIcons name="plus" size={20} color={colors.ink} />}
          onPress={() =>
            onChange([...groups, { key: newDraftKey(), name: "", options: [blankOption()] }])
          }
        />
      ) : null}
      <Text style={type.micro}>
        Selisih harga: angka tambahan per porsi. Pakai tanda minus untuk lebih murah.
      </Text>
    </View>
  );
}

function IconButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: colors.line, borderless: true }}
      style={[styles.iconButton, disabled && styles.iconDisabled]}
    >
      <MaterialCommunityIcons name={icon} size={22} color={colors.inkMuted} />
    </Pressable>
  );
}

const DELTA_WIDTH = 104;

const styles = StyleSheet.create({
  root: { gap: space.md },
  group: {
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  groupHead: { flexDirection: "row", alignItems: "center", gap: space.xs },
  optionRow: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingLeft: space.md },
  flex: { flex: 1 },
  delta: { width: DELTA_WIDTH },
  iconButton: {
    width: touch.min,
    height: touch.min,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  iconDisabled: { opacity: 0.35 },
});
