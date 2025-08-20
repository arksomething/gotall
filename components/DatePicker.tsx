import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  generateDays,
  generateMonths,
  generateYears,
} from "../utils/datePickerData";
import { SafePicker } from "./SafePicker";

interface DatePickerProps {
  onDateChange: (date: Date) => void;
  initialDate?: Date;
}

const getAbbreviatedMonth = (month: string): string => {
  const date = new Date(Date.parse(`${month} 1, 2000`));
  return date.toLocaleString("default", { month: "short" });
};

export const DatePicker: React.FC<DatePickerProps> = ({
  onDateChange,
  initialDate = new Date(2004, 0, 1),
}) => {
  const [selectedYear, setSelectedYear] = useState(
    initialDate.getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    initialDate.toLocaleString("default", { month: "short" })
  );
  const [selectedDay, setSelectedDay] = useState(
    initialDate.getDate().toString()
  );

  const years = useMemo(() => generateYears(), []);
  const months = useMemo(() => generateMonths(), []);
  // Keep days list fixed at 31 to avoid remounts during wheel interaction.
  const DAYS_IN_MONTH_VIEW = 31;
  const validDaysCount = useMemo(
    () =>
      generateDays(parseInt(selectedYear), months.indexOf(selectedMonth))
        .length,
    [selectedYear, selectedMonth, months]
  );
  const days = useMemo(
    () => Array.from({ length: DAYS_IN_MONTH_VIEW }, (_, i) => i + 1),
    []
  );
  const pendingClampRef = useRef<null | { year: string; month: string }>(null);

  // Defer clamping the selected day until after interactions complete
  useEffect(() => {
    const currentDay = parseInt(selectedDay);
    if (currentDay > validDaysCount) {
      pendingClampRef.current = { year: selectedYear, month: selectedMonth };
      InteractionManager.runAfterInteractions(() => {
        // Only clamp if year/month didn't change again
        const pending = pendingClampRef.current;
        if (
          pending &&
          pending.year === selectedYear &&
          pending.month === selectedMonth
        ) {
          setSelectedDay(validDaysCount.toString());
          pendingClampRef.current = null;
        }
      });
    }
  }, [validDaysCount, selectedDay, selectedYear, selectedMonth]);

  useEffect(() => {
    const monthIndex = months.indexOf(selectedMonth);
    if (monthIndex < 0) return;

    const date = new Date(
      parseInt(selectedYear),
      monthIndex,
      parseInt(selectedDay)
    );
    onDateChange(date);
  }, [selectedYear, selectedMonth, selectedDay, months, onDateChange]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your date of birth</Text>
      <View style={styles.pickerContainer}>
        <View style={[styles.pickerColumn, { flex: 0.9 }]}>
          <Text style={styles.label}>Month</Text>
          <View style={styles.pickerWrapper}>
            <SafePicker
              selectedValue={selectedMonth}
              onValueChange={(value: string) =>
                setSelectedMonth(value.toString())
              }
              dropdownIconColor="#9ACD32"
              mode="dropdown"
              style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
              itemStyle={styles.pickerItem}
              items={months.map((month) => ({ label: month, value: month }))}
            />
          </View>
        </View>
        <View style={[styles.pickerColumn, { flex: 0.8 }]}>
          <Text style={styles.label}>Day</Text>
          <View style={styles.pickerWrapper}>
            <SafePicker
              selectedValue={selectedDay}
              onValueChange={(value: string) =>
                setSelectedDay(value.toString())
              }
              dropdownIconColor="#9ACD32"
              mode="dropdown"
              style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
              itemStyle={styles.pickerItem}
              items={days.map((day) => {
                const isValid = day <= validDaysCount;
                return {
                  label: day.toString(),
                  value: day.toString(),
                  color: isValid
                    ? Platform.OS === "ios"
                      ? "#fff"
                      : "#9ACD32"
                    : "#555",
                  enabled: isValid,
                } as any;
              })}
            />
          </View>
        </View>
        <View style={[styles.pickerColumn, { flex: 1.4 }]}>
          <Text style={styles.label}>Year</Text>
          <View style={styles.pickerWrapper}>
            <SafePicker
              selectedValue={selectedYear}
              onValueChange={(value: string) =>
                setSelectedYear(value.toString())
              }
              dropdownIconColor="#9ACD32"
              mode="dropdown"
              style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
              itemStyle={styles.pickerItem}
              items={years.map((year) => ({
                label: year.toString(),
                value: year.toString(),
              }))}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 16,
  },
  pickerColumn: {
    minWidth: Platform.OS === "ios" ? 65 : 55,
  },
  label: {
    color: "#9ACD32",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#9ACD32",
  },
  pickerWrapper: {
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  picker: {
    backgroundColor: "#111",
    color: Platform.OS === "ios" ? "#fff" : "#9ACD32",
  },
  pickerIOS: {
    height: 200,
  },
  pickerItem: {
    fontSize: Platform.OS === "ios" ? 16 : 14,
  },
});
