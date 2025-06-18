export const generateYears = (startYear = 1950): string[] => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = startYear; year <= currentYear; year++) {
    years.push(year.toString());
  }
  return years.reverse();
};

export const generateMonths = (): string[] => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months;
};

export const generateDays = (year: number, month: number): string[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day.toString());
  }
  return days;
}; 