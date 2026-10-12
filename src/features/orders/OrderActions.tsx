import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import type { ActiveOrder, DeliveryFailureReason } from "@/api/schemas/orders";
import { Alert, Button, Field, Input, Sheet } from "@/components/ui";
import { colors, fonts, radius, space, touch, type } from "@/theme";

import {
  DELIVERY_FAILURE_REASON_LABEL,
  MERCHANT_ACTION_LABEL,
  minutesUntilDeliveryFailAllowed,
  nextMerchantStatus,
} from "./order-status";
import { useOrderActions } from "./use-orders";

const REASONS = Object.keys(DELIVERY_FAILURE_REASON_LABEL) as DeliveryFailureReason[];

export function OrderActions({ order }: { order: ActiveOrder }) {
  const { advance, markPaid, deliveryFailed } = useOrderActions();
  const [confirmPaid, setConfirmPaid] = useState(false);
  const [failOpen, setFailOpen] = useState(false);

  const upcoming = nextMerchantStatus(order.status, order.fulfillmentMethod);
  const actionLabel = upcoming
    ? MERCHANT_ACTION_LABEL[order.fulfillmentMethod][order.status]
    : null;
  const error = advance.error ?? markPaid.error;
  const canFailDelivery = order.status === "sedang_diantar" && order.delivery !== null;

  if (order.awaitingManualConfirmation) {
    return (
      <View style={styles.root}>
        {markPaid.error ? <Alert tone="error" message={errorMessage(markPaid.error)} /> : null}
        <Text style={type.caption}>
          Pesanan QRIS Pribadi. Tandai lunas setelah uangnya masuk ke rekening atau e-wallet kamu.
        </Text>
        <Button
          label="Tandai Lunas"
          size="lg"
          fullWidth
          loading={markPaid.isPending}
          onPress={() => setConfirmPaid(true)}
        />
        <Sheet
          visible={confirmPaid}
          title={`Tandai Pesanan ${order.orderCode} lunas?`}
          description="Pastikan uangnya sudah masuk. Status lunas tidak bisa dibatalkan."
          onClose={() => setConfirmPaid(false)}
        >
          <Button
            label="Ya, sudah lunas"
            size="lg"
            fullWidth
            loading={markPaid.isPending}
            onPress={() => markPaid.mutate({ order }, { onSettled: () => setConfirmPaid(false) })}
          />
          <Button label="Batal" variant="ghost" fullWidth onPress={() => setConfirmPaid(false)} />
        </Sheet>
      </View>
    );
  }

  if (!actionLabel && !canFailDelivery) return null;

  return (
    <View style={styles.root}>
      {error ? <Alert tone="error" message={errorMessage(error)} /> : null}
      {upcoming && actionLabel ? (
        <Button
          label={actionLabel}
          size="lg"
          fullWidth
          loading={advance.isPending}
          onPress={() => advance.mutate({ order, to: upcoming })}
        />
      ) : null}
      {canFailDelivery ? (
        <>
          <Button
            label="Gagal Diantar"
            variant="dangerOutline"
            fullWidth
            onPress={() => setFailOpen(true)}
          />
          <DeliveryFailedSheet
            visible={failOpen}
            order={order}
            pending={deliveryFailed.isPending}
            error={deliveryFailed.error ? errorMessage(deliveryFailed.error) : null}
            onClose={() => {
              setFailOpen(false);
              deliveryFailed.reset();
            }}
            onSubmit={(reason, note) =>
              deliveryFailed.mutate(
                { order, reason, note },
                { onSuccess: () => setFailOpen(false) },
              )
            }
          />
        </>
      ) : null}
    </View>
  );
}

type DeliveryFailedSheetProps = {
  visible: boolean;
  order: ActiveOrder;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (reason: DeliveryFailureReason, note: string) => void;
};

function DeliveryFailedSheet({
  visible,
  order,
  pending,
  error,
  onClose,
  onSubmit,
}: DeliveryFailedSheetProps) {
  const [reason, setReason] = useState<DeliveryFailureReason | null>(null);
  const [note, setNote] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!visible) return;
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, [visible]);

  // Jeda ini hanya petunjuk; server yang memutuskan boleh atau tidak.
  const waitMinutes = minutesUntilDeliveryFailAllowed(order.delivery?.startedAt ?? null, now);
  const submitLabel =
    waitMinutes > 0 ? `Bisa ditandai ${waitMinutes} menit lagi` : "Tandai Gagal Diantar";

  return (
    <Sheet
      visible={visible}
      title={`Pesanan ${order.orderCode} gagal diantar`}
      description="Tidak ada pengembalian dana ke Pembeli. Hubungi Pembeli dulu sebelum menandai gagal."
      onClose={onClose}
    >
      <View style={styles.reasons} accessibilityRole="radiogroup">
        {REASONS.map((value) => {
          const selected = reason === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setReason(value)}
              style={[styles.reason, selected && styles.reasonSelected]}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.reasonLabel}>{DELIVERY_FAILURE_REASON_LABEL[value]}</Text>
            </Pressable>
          );
        })}
      </View>
      <Field label="Catatan (opsional)">
        <Input
          value={note}
          onChangeText={setNote}
          maxLength={500}
          placeholder="Mis. sudah ditelepon 3 kali"
        />
      </Field>
      {error ? <Alert tone="error" message={error} /> : null}
      <Button
        label={submitLabel}
        variant="danger"
        size="lg"
        fullWidth
        loading={pending}
        disabled={reason === null || waitMinutes > 0}
        onPress={() => reason && onSubmit(reason, note)}
      />
    </Sheet>
  );
}

const RADIO = 22;

const styles = StyleSheet.create({
  root: { gap: space.md },
  reasons: { gap: space.sm },
  reason: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: touch.min,
    paddingHorizontal: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.line,
  },
  reasonSelected: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  radio: {
    width: RADIO,
    height: RADIO,
    borderRadius: RADIO / 2,
    borderWidth: 2,
    borderColor: colors.inkMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.danger },
  radioDot: {
    width: RADIO / 2,
    height: RADIO / 2,
    borderRadius: RADIO / 4,
    backgroundColor: colors.danger,
  },
  reasonLabel: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: colors.ink },
});
