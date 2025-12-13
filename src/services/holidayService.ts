import { Holiday } from "@interfaces/Holiday";

/**
 * Holiday Service - Handles API communication for holidays
 */

class HolidayService {
  private API = process.env.EXPO_PUBLIC_API_URL;
  private holidayCache: Map<number, Holiday[]> = new Map();

  /**
   * Get all holidays for a specific year
   */
  async getByYear(year: number): Promise<Holiday[]> {
    // Check cache first
    if (this.holidayCache.has(year)) {
      return this.holidayCache.get(year)!;
    }

    try {
      const response = await fetch(`${this.API}holidays/year/${year}`);

      if (!response.ok) {
        throw new Error("Failed to fetch holidays by year");
      }

      if (response.status === 204) {
        return [];
      }

      const data = await response.json();

      // Transform dates from string to Date objects
      const holidays: Holiday[] = data.map((item: any) => ({
        ...item,
        date: new Date(item.date),
      }));

      // Cache the result
      this.holidayCache.set(year, holidays);

      return holidays;
    } catch (error) {
      console.error("Error fetching holidays:", error);
      // Return empty array on error to not block vacation requests
      return [];
    }
  }

  /**
   * Check if a specific date is a holiday
   */
  async isHoliday(date: Date): Promise<boolean> {
    const year = date.getFullYear();
    const holidays = await this.getByYear(year);

    return holidays.some((holiday) => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getDate() === date.getDate() &&
        holidayDate.getMonth() === date.getMonth() &&
        holidayDate.getFullYear() === date.getFullYear()
      );
    });
  }

  /**
   * Get all holidays between two dates
   */
  async getHolidaysBetweenDates(
    startDate: Date,
    endDate: Date
  ): Promise<Holiday[]> {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const allHolidays: Holiday[] = [];

    // Fetch holidays for all years in the range
    for (let year = startYear; year <= endYear; year++) {
      const yearHolidays = await this.getByYear(year);
      allHolidays.push(...yearHolidays);
    }

    // Filter holidays that fall within the date range
    return allHolidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= startDate && holidayDate <= endDate;
    });
  }

  /**
   * Clear cache (useful when holidays are updated)
   */
  clearCache(): void {
    this.holidayCache.clear();
  }
}

export const holidayService = new HolidayService();
