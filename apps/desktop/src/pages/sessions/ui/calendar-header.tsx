import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@atlas/ui/components/button";
import { currentLocale } from "@/i18n";

interface CalendarHeaderProps {
  cursor: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  cursor,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-4">
      <h3 className="text-sm font-semibold">
        {cursor.toLocaleDateString(currentLocale(), {
          month: "long",
          year: "numeric",
        })}
      </h3>
      <div className="flex items-center gap-1">
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
