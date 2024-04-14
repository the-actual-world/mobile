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

export default function () {
  const { t } = useTranslation();
  const { session, user } = useSupabase();

  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );

  const alertRef = useAlert();

  const { colorScheme } = useColorScheme();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["60%"], []);

  const [summaries, setSummaries] = React.useState<Tables<"summaries">[]>([]);

  async function getSummaries(month?: DateData) {
    const { data, error } = await sb
      .from("summaries")
      .select("*")
      .lt(
        "created_at",
        (month ? month?.dateString : new Date().toISOString().split("T")[0]) +
          "T23:59:59.999Z"
      )
      .gt(
        "created_at",
        (month ? month?.dateString : new Date().toISOString().split("T")[0]) +
          "T00:00:00.000Z"
      );

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
    getSummaries();
  }, []);

  const [currentSummary, setCurrentSummary] = React.useState<
    Tables<"summaries">
  >({});

  useEffect(() => {
    setCurrentSummary(
      //@ts-ignore
      summaries.find((summary) => summary.date === selectedDate) || {
        date: selectedDate,
        content: "",
        ai_content: "",
      }
    );
  }, [selectedDate]);

  async function saveSummary() {
    const { data, error } = await sb
      .from("summaries")
      .upsert({ ...currentSummary, user_id: session?.user.id });

    console.log("saveSummary", data, error);
    console.log(currentSummary);

    if (error) {
      console.error(error);
      return;
    }

    getSummaries();
    alertRef.current?.showAlert({
      title: t("common:success"),
      message: t("rewind:summary-saved"),
    });
    bottomSheetModalRef.current?.dismiss();
  }

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
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-4`}>
          <Text
            style={[
              tw`text-xl mb-3 text-center`,
              {
                fontFamily: fonts.inter.semiBold,
              },
            ]}
          >
            {new Date(selectedDate).toLocaleDateString()}
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
            onPress={saveSummary}
            variant="secondary"
            style={tw`mb-2`}
          />

          <View style={tw`gap-2 mb-2`}>
            <Text style={tw`text-lg`}>{t("rewind:personal-notes")}</Text>
            <BottomSheetInput
              multiline
              numberOfLines={4}
              placeholder={t("common:write-something")}
              value={currentSummary.content}
              onChangeText={(text) => {
                setCurrentSummary((prev) => ({
                  ...prev,
                  content: text,
                }));
              }}
            />
          </View>

          {/* Only render if selected date is before today */}
          {new Date(selectedDate).getDate() < new Date().getDate() && (
            <View style={tw`gap-2`}>
              <Text style={tw`text-lg`}>{t("rewind:ai-summary")}</Text>
              {currentSummary.ai_content ? (
                <Text
                  style={[
                    tw`text-sm`,
                    {
                      fontFamily: fonts.inter.regular,
                    },
                  ]}
                >
                  {currentSummary.ai_content}
                </Text>
              ) : (
                <Button
                  label={t("rewind:generate-summary")}
                  icon={<BrainIcon size={16} color="white" />}
                />
              )}
            </View>
          )}
        </ScrollView>
      </BottomSheetModal>
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          bottomSheetModalRef.current?.present();
        }}
        markingType="multi-dot"
        markedDates={summaries.reduce((acc, summary) => {
          const dotsArray = [];
          if (summary.ai_content) {
            dotsArray.push({
              key: summary.date + "ai",
              color:
                colorScheme === "dark"
                  ? tw.color("dark-muted-foreground")
                  : tw.color("muted-foreground"),
            });
          }
          if (summary.content) {
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
        enableSwipeMonths
        onMonthChange={(date) => {
          getSummaries(date);
        }}
      />
    </Background>
  );
}
