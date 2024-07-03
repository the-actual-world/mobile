import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import React, { useEffect } from "react";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { fonts } from "@/lib/styles";
import Calendar from "@/components/ui/Calendar";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetInput } from "@/components/ui/BottomSheetInput";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { BrainIcon, SaveIcon } from "lucide-react-native";
import { DateData } from "react-native-calendars";
import { ScrollView } from "react-native-gesture-handler";
import { useAlert } from "@/context/AlertProvider";
import { Tables } from "@/supabase/functions/_shared/supabase";
import MapView from "react-native-maps";
import { DateUtils } from "@/lib/utils";

export default function () {
  const { t, i18n } = useTranslation();
  const { session, user } = useSupabase();

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const alertRef = useAlert();

  const { colorScheme } = useColorScheme();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["60%"], []);

  const [summaries, setSummaries] = React.useState<Tables<"summaries">[]>([]);

  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);

  async function getSummaries(month: number) {
    const adjustedMonth = month - 1;

    const { data, error } = await sb
      .from("summaries")
      .select("*")
      .lte(
        "date",
        new Date(new Date().getFullYear(), adjustedMonth + 1, 0)
          .toISOString()
          .split("T")[0]
      )
      .gte(
        "date",
        new Date(new Date().getFullYear(), adjustedMonth, 1)
          .toISOString()
          .split("T")[0]
      )
      .eq("user_id", session?.user.id as string);

    console.log(data, error);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setSummaries(data);
    }
  }

  React.useEffect(() => {
    getSummaries(new Date().getMonth() + 1);
  }, []);

  async function saveNote(content: string) {
    if (!selectedDate) return;
    console.log("CONTENT: " + content);

    const { error } = await sb.from("summaries").upsert([
      {
        user_id: session?.user.id,
        date: DateUtils.getYYYYMMDD(selectedDate) as string,
        content: content,
        ai_summary: false,
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    getSummaries(selectedDate?.getMonth()! + 1);
    alertRef.current?.showAlert({
      title: t("common:success"),
      message: t("rewind:summary-saved"),
    });
    bottomSheetModalRef.current?.dismiss();
  }

  React.useEffect(() => {
    if (selectedDate) {
      console.log(selectedDate);
      if (
        !summaries.find(
          (summary) =>
            summary.date === DateUtils.getYYYYMMDD(selectedDate) &&
            summary.ai_summary === false
        )
      ) {
        setSummaries((prev) => [
          ...prev,
          {
            user_id: session?.user.id as string,
            date: DateUtils.getYYYYMMDD(selectedDate) as string,
            content: "",
            ai_summary: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }
  }, [selectedDate]);

  return (
    <Background noPadding>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enableContentPanningGesture={false}
        backgroundStyle={tw`bg-new-bg border-t border-bd`}
        handleIndicatorStyle={tw`bg-mt-fg`}
        style={tw`px-4 py-3 mt-10`}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.5}
            enableTouchThrough={false}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            style={[
              { backgroundColor: "rgba(0, 0, 0, 1)" },
              StyleSheet.absoluteFillObject,
            ]}
          />
        )}
      >
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-4 pb-20`}>
          <Text
            style={[
              tw`text-xl mb-3 text-center`,
              {
                fontFamily: fonts.inter.semiBold,
              },
            ]}
          >
            {selectedDate
              ? DateUtils.getDateDescription(selectedDate!, i18n.language)
              : ""}
          </Text>

          <Button
            label={t("common:save")}
            icon={
              <SaveIcon
                size={16}
                color={
                  colorScheme === "dark"
                    ? tw.color("dark-muted-foreground")
                    : tw.color("muted-foreground")
                }
              />
            }
            onPress={() => {
              saveNote(
                summaries.find(
                  (summary) =>
                    summary.date === DateUtils.getYYYYMMDD(selectedDate!) &&
                    summary.ai_summary === false
                )?.content || ""
              );
            }}
            variant="secondary"
            style={tw`mb-2`}
          />

          <View style={tw`gap-2 mb-2`}>
            <Text style={tw`text-lg`}>{t("rewind:personal-notes")}</Text>
            <BottomSheetInput
              multiline
              numberOfLines={4}
              placeholder={t("common:write-something")}
              defaultValue={
                summaries.find(
                  (summary) =>
                    summary.date === DateUtils.getYYYYMMDD(selectedDate!) &&
                    summary.ai_summary === false
                )?.content || ""
              }
              onChangeText={(text) =>
                setSummaries((prev) =>
                  prev.map((summary) => {
                    if (
                      summary.date === DateUtils.getYYYYMMDD(selectedDate!) &&
                      summary.ai_summary === false
                    ) {
                      return {
                        ...summary,
                        content: text,
                      };
                    }
                    return summary;
                  })
                )
              }
            />
          </View>

          {/* Only render if selected date is before today */}
          {selectedDate &&
            selectedDate <
              new Date(new Date().setDate(new Date().getDate() - 1)) && (
              <View style={tw`gap-2`}>
                <Text style={tw`text-lg`}>{t("rewind:ai-summary")}</Text>
                {summaries.find(
                  (summary) =>
                    summary.date === DateUtils.getYYYYMMDD(selectedDate!) &&
                    summary.ai_summary
                ) ? (
                  <Text
                    style={[
                      tw`text-sm`,
                      {
                        fontFamily: fonts.inter.regular,
                      },
                    ]}
                  >
                    {
                      summaries.find(
                        (summary) =>
                          summary.date ===
                            DateUtils.getYYYYMMDD(selectedDate!) &&
                          summary.ai_summary
                      )?.content
                    }
                  </Text>
                ) : (
                  <Button
                    isLoading={isGeneratingSummary}
                    label={t("rewind:generate-summary")}
                    onPress={async () => {
                      setIsGeneratingSummary(true);
                      const { data } = await sb.functions.invoke(
                        "generate-summary",
                        {
                          body: {
                            userLanguage: i18n.language,
                            day: selectedDate.getDate(),
                            month: selectedDate.getMonth() + 1,
                            year: selectedDate.getFullYear(),
                          },
                        }
                      );

                      if (data) {
                        setSummaries((prev) => [
                          ...prev,
                          {
                            user_id: session?.user.id as string,
                            date: DateUtils.getYYYYMMDD(selectedDate) as string,
                            content: data.content,
                            ai_summary: true,
                            created_at: new Date().toISOString(),
                          },
                        ]);
                      }

                      setIsGeneratingSummary(false);
                    }}
                    icon={<BrainIcon size={16} color="white" />}
                  />
                )}
              </View>
            )}
        </ScrollView>
      </BottomSheetModal>

      <Calendar
        onDayPress={(day) => {
          setSelectedDate(new Date(day.dateString));
          bottomSheetModalRef.current?.present();
        }}
        markingType="multi-dot"
        markedDates={summaries.reduce((acc, summary) => {
          const dotsArray = [];
          if (summary.content && summary.ai_summary) {
            dotsArray.push({
              key: summary.date + "ai",
              color:
                colorScheme === "dark"
                  ? tw.color("dark-muted-foreground")
                  : tw.color("muted-foreground"),
            });
          } else if (summary.content && !summary.ai_summary) {
            dotsArray.push({
              key: summary.date,
              color: tw.color("accent") || "",
            });
          }

          acc[summary.date] = acc[summary.date]
            ? {
                ...acc[summary.date],
                marked: true,
                dots: [...acc[summary.date].dots, ...dotsArray],
              }
            : {
                marked: true,
                dots: dotsArray,
              };

          return acc;
        }, {})}
        // yesterday
        maxDate={
          new Date(new Date().setDate(new Date().getDate()))
            .toISOString()
            .split("T")[0]
        }
        // when the user was created
        minDate={
          new Date(session?.user.created_at || "").toISOString().split("T")[0]
        }
        disableAllTouchEventsForDisabledDays
        // enableSwipeMonths
        onMonthChange={(date) => {
          getSummaries(date.month);
        }}
      />
    </Background>
  );
}
