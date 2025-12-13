import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { DateData, Calendar as RNCalendar, CalendarProps } from "react-native-calendars";

type Props = {
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  markedDates?: CalendarProps['markedDates'];
  markingType?: CalendarProps['markingType'];
  minDate?: string;
  current?: string;
  theme?: CalendarProps['theme'];
  enableSwipeMonths?: boolean;
};

export function Calendar({ 
  selectedDate, 
  onSelectDate, 
  markedDates,
  markingType,
  minDate,
  current,
  theme,
  enableSwipeMonths = true,
}: Props) {
  const defaultMarkedDates = selectedDate && !markedDates
    ? {
        [selectedDate]: {
          selected: true,
          selectedColor: "#2563EB",
        },
      }
    : markedDates || {};

  const defaultTheme = theme || {
    backgroundColor: "#ffffff",
    calendarBackground: "#ffffff",
    textSectionTitleColor: "#6B7280",
    selectedDayBackgroundColor: "#2563EB",
    selectedDayTextColor: "#ffffff",
    todayTextColor: "#2563EB",
    dayTextColor: "#111827",
    textDisabledColor: "#D1D5DB",
    arrowColor: "#111827",
    monthTextColor: "#111827",
    textDayFontSize: 14,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 12,
  };

  return (
    <View style={styles.container}>
      <RNCalendar
        current={current || selectedDate}
        minDate={minDate}
        onDayPress={(day: DateData) => {
          onSelectDate?.(day.dateString);
        }}
        markedDates={defaultMarkedDates}
        markingType={markingType}
        enableSwipeMonths={enableSwipeMonths}
        renderArrow={(direction) =>
          direction === "left" ? (
            <ChevronLeft size={24} color="#111" />
          ) : (
            <ChevronRight size={24} color="#111" />
          )
        }
        theme={defaultTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
});
