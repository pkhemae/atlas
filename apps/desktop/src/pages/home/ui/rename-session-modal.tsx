import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@atlas/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@atlas/ui/components/dialog";
import { Input } from "@atlas/ui/components/input";

interface RenameSessionModalProps {
  open: boolean;
  /** The session's current name, seeding the field on open. */
  initialName: string;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
}

export function RenameSessionModal({
  open,
  initialName,
  pending,
  onOpenChange,
  onSubmit,
}: RenameSessionModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);

  // re-seed whenever a (new) session opens the modal — render-time prop
  // comparison instead of an effect (no remount, so the dialog's exit
  // animation survives; see react.dev "adjusting state when a prop changes")
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setName(initialName);
  }

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("home.recent.rename")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("home.recent.renamePlaceholder")}
            maxLength={80}
            autoFocus
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={pending || name.trim().length === 0}
            >
              {t("home.recent.renameSave")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
