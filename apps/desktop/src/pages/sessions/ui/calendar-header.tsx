import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@atlas/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@atlas/ui/components/select";
import { currentLocale } from "@/i18n";
import { formatTotal } from "@/lib/focus";
import { MIN_DURATION_OPTIONS, type MinDuration } from "@/lib/session-filter";

interface CalendarHeaderProps {
  cursor: Date;
  minDuration: MinDuration;
  onMinDurationChange: (minDuration: MinDuration) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  cursor,
  minDuration,
  onMinDurationChange,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-4 pb-3">
      {/* French locales emit lowercase month names — fine mid-sentence,
          not as a title */}
      <h3 className="text-[15px] font-semibold capitalize">
        {cursor.toLocaleDateString(currentLocale(), {
          month: "long",
          year: "numeric",
        })}
      </h3>
      <div className="flex items-center gap-1">
        {/* duration filter: hide anything shorter than the picked floor */}
        <Select
          value={String(minDuration)}
          onValueChange={(value) =>
            onMinDurationChange(Number(value) as MinDuration)
          }
        >
          <SelectTrigger
            size="sm"
            aria-label={t("sessions.filterLabel")}
            className="mr-2 shrink-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="end">
            {MIN_DURATION_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option === 0
                  ? t("sessions.filterAll")
                  : t("sessions.filterAtLeast", {
                      duration: formatTotal(option),
                    })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("sessions.previousMonth")}
          onClick={onPrev}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onToday}>
          {t("sessions.today")}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("sessions.nextMonth")}
          onClick={onNext}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  );
}
