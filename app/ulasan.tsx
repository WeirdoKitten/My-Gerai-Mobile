import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import type { ReviewsPage } from "@/api/schemas/reports";
import { Alert, Button, Card, EmptyState, Spinner, StarRating, SubScreen } from "@/components/ui";
import { useReviews } from "@/features/reports/use-reports";
import { formatDateTime, formatRating } from "@/lib/format/datetime";
import { colors, fonts, layout, radius, space, type } from "@/theme";

export default function ReviewsScreen() {
  const reviews = useReviews();
  const page = reviews.data;

  return (
    <SubScreen title="Rating & Ulasan">
      {reviews.isPending ? (
        <View style={styles.center}>
          <Spinner size="large" />
        </View>
      ) : reviews.error && !page ? (
        <View style={styles.pad}>
          <Alert tone="error" message={errorMessage(reviews.error)} />
          <Button label="Coba lagi" variant="secondary" onPress={() => reviews.refetch()} />
        </View>
      ) : page ? (
        <FlatList
          data={page.reviews}
          keyExtractor={(review) => review.id}
          contentContainerStyle={page.reviews.length > 0 ? styles.list : styles.emptyList}
          ListHeaderComponent={page.summary.average !== null ? <Summary page={page} /> : null}
          ListEmptyComponent={
            <EmptyState
              icon="star-outline"
              title="Belum ada ulasan"
              description="Pembeli bisa memberi rating dan ulasan setelah Pesanan mereka selesai."
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.review}>
              <View style={styles.reviewHead}>
                <Text style={[type.bodyStrong, styles.flex]} numberOfLines={1}>
                  {item.buyerName}
                </Text>
                <Text style={styles.code}>{item.orderCode}</Text>
              </View>
              <StarRating value={item.rating} />
              {item.comment ? <Text style={type.body}>{item.comment}</Text> : null}
              <Text style={type.micro}>{formatDateTime(item.createdAt)}</Text>
            </Card>
          )}
          refreshControl={
            <RefreshControl
              refreshing={reviews.isRefetching}
              onRefresh={() => reviews.refetch()}
              colors={[colors.brandStrong]}
            />
          }
        />
      ) : null}
    </SubScreen>
  );
}

function Summary({ page }: { page: ReviewsPage }) {
  const average = page.summary.average ?? 0;
  const maxCount = Math.max(...page.distribution, 1);
  return (
    <Card style={styles.summary}>
      <View style={styles.score}>
        <Text style={styles.average}>{formatRating(average)}</Text>
        <StarRating value={average} size={18} />
        <Text style={type.micro}>{page.summary.count} ulasan</Text>
      </View>
      <View style={styles.bars}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = page.distribution[star - 1] ?? 0;
          return (
            <View
              key={star}
              style={styles.barRow}
              accessible
              accessibilityLabel={`${star} bintang: ${count} ulasan`}
            >
              <Text style={[type.micro, styles.barLabel]}>{star}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(count / maxCount) * 100}%` }]} />
              </View>
              <Text style={[type.micro, styles.barCount]}>{count}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  pad: { padding: layout.screenPaddingX, gap: space.md },
  list: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.xxxl,
    gap: space.md,
  },
  emptyList: { flexGrow: 1, justifyContent: "center", padding: layout.screenPaddingX },
  summary: { flexDirection: "row", alignItems: "center", gap: space.xl, marginBottom: space.sm },
  score: { alignItems: "center", gap: space.xs },
  average: {
    fontFamily: fonts.extrabold,
    fontSize: 40,
    lineHeight: 46,
    color: colors.ink,
  },
  bars: { flex: 1, gap: space.xs + 2 },
  barRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  barLabel: { width: 10, textAlign: "center" },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralBg,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.brand },
  barCount: { width: 24, textAlign: "right", fontVariant: ["tabular-nums"] },
  review: { gap: space.sm },
  reviewHead: { flexDirection: "row", alignItems: "center", gap: space.md },
  code: { ...type.micro, fontFamily: fonts.semibold, letterSpacing: 1 },
});
