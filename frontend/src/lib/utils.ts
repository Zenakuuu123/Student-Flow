import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface DateRange {
  start: string;
  end: string;
}

export function parseDescriptionAndRange(description: string | null): { cleanDescription: string; range: DateRange | null } {
  if (!description) return { cleanDescription: '', range: null };
  const regex = /\[date_range:([^,]*),([^\]]*)\]/;
  const match = description.match(regex);
  if (match) {
    return {
      cleanDescription: description.replace(regex, '').trim(),
      range: {
        start: match[1],
        end: match[2]
      }
    };
  }
  return { cleanDescription: description, range: null };
}

export function formatDescriptionWithRange(cleanDescription: string, range: DateRange | null): string {
  const desc = cleanDescription.trim();
  if (!range || !range.start || !range.end) return desc;
  return `${desc}\n\n[date_range:${range.start},${range.end}]`.trim();
}

export function formatDueDateRange(dueDate: string | null, description: string | null): string {
  if (!dueDate) return 'No due date';
  const { range } = parseDescriptionAndRange(description);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  if (range && range.start && range.end) {
    return `From ${formatDate(range.start)} to ${formatDate(range.end)}`;
  }
  
  return formatDate(dueDate);
}

export function parseCourseName(fullName: string | undefined | null): string {
  if (!fullName) return '';
  const regex = /\[professor:([^\]]*)\]/;
  return fullName.replace(regex, '').trim();
}

export function parseCourseProfessor(fullName: string | undefined | null): string {
  if (!fullName) return '';
  const regex = /\[professor:([^\]]*)\]/;
  const match = fullName.match(regex);
  return match ? match[1].trim() : '';
}
