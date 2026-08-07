import { useTranslation } from "react-i18next";
import { Button } from "@atlas/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@atlas/ui/components/dialog";

interface DeleteSessionDialogProps {
  open: boolean;
  /** Shown in the title so the user knows what dies. */
  sessionName: string;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteSessionDialog({
  open,
  sessionName,
  pending,
  onOpenChange,
  onConfirm,
}: DeleteSessionDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {t("home.recent.deleteTitle", { name: sessionName })}
          </DialogTitle>
          <DialogDescription>{t("home.recent.deleteBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={onConfirm}
          >
            {t("home.recent.deleteConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
