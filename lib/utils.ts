import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { Doc } from "@/convex/_generated/dataModel";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleNavigation = (
  currentUser: Doc<"users">,
  url: string,
  push: (url: string) => void
) => {
  if (!currentUser) {
    toast.error("please login to continue");
    return;
  }
  push(url);
};

export function formatDateTime(dateTimeString: string): {
  date: string;
  time: string;
} {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Create a Date object from the input string in UTC
  const dateObj = new Date(dateTimeString);

  // Convert to local time
  const localDate = new Date(
    dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
  );

  // Get local time components
  const day = localDate.getDate();
  const monthIndex = localDate.getMonth();
  const year = localDate.getFullYear();
  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();

  // Format the date and time
  const formattedDate = `${day} ${months[monthIndex]} ${year}`;
  const formattedTime = formatTime(hours, minutes);

  return { date: formattedDate, time: formattedTime };
}

function formatTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const formattedTime = `${hour12}:${minutes < 10 ? "0" : ""}${minutes} ${period}`;
  return formattedTime;
}

export function formatNumberWithCommas(number: number): string {
  if (number === 0) {
    return "0.00";
  }
  const formattedNumber = number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  return formattedNumber;
}
export const truncateText = (text: string, maxLength: number = 50) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export function filterTransactionsLast30Days(transactions: Doc<"transactions">[]) {
  // Calculate timestamp for 30 days ago (30 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  // Filter transactions where _creationTime is greater than thirtyDaysAgo
  return transactions.filter(transaction => transaction._creationTime > thirtyDaysAgo);
}

