import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
  generateDays,
  generateMonths,
  generateYears,
} from "../utils/datePickerData";

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
  const days = useMemo(
    () => generateDays(parseInt(selectedYear), months.indexOf(selectedMonth)),
    [selectedYear, selectedMonth, months]
  );

  useEffect(() => {
    const currentDay = parseInt(selectedDay);
    if (currentDay > days.length) {
      setSelectedDay(days.length.toString());
    }
  }, [days, selectedDay]);

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
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(value) => setSelectedMonth(value.toString())}
              dropdownIconColor="#9ACD32"
              mode="dropdown"
              style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
              itemStyle={styles.pickerItem}
            >
              {months.map((month) => (
                <Picker.Item
                  key={month}
                  label={month}
                  value={month}
                  color={Platform.OS === "ios" ? "#fff" : "#9ACD32"}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View style={[styles.pickerColumn, { flex: 0.8 }]}>
          <Text style={styles.label}>Day</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedDay}
              onValueChange={(value) => setSelectedDay(value.toString())}
              dropdownIconColor="#9ACD32"
              mode="dropdown"
              style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
              itemStyle={styles.pickerItem}
            >
              {days.map((day) => (
                <Picker.Item
                  key={day}
                  label={day}
                  value={day}
                  color={Platform.OS === "ios" ? "#fff" : "#9ACD32"}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View style={[styles.pickerColumn, { flex: 1.4 }]}>
          <Text style={styles.label}>Year</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={(value) => setSelectedYear(value.toString())}
              dropdownIconColor="#9ACD32"
              mode="dropdown"
              style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
              itemStyle={styles.pickerItem}
            >
              {years.map((year) => (
                <Picker.Item
                  key={year}
                  label={year}
                  value={year}
                  color={Platform.OS === "ios" ? "#fff" : "#9ACD32"}
                />
              ))}
            </Picker>
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
