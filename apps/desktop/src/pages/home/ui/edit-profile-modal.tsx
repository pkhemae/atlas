import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Pencil, Trash2, Upload } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@atlas/ui/components/avatar";
import { Button } from "@atlas/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@atlas/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@atlas/ui/components/dropdown-menu";
import { Input } from "@atlas/ui/components/input";
import { Label } from "@atlas/ui/components/label";
import { Textarea } from "@atlas/ui/components/textarea";
import type { AuthUser } from "@/lib/api";

const ACCEPTED_IMAGES = "image/png,image/jpeg,image/webp";
const BIO_MAX = 160;

// raw form state — the feature layer turns it into the API payload
export interface EditProfileFormState {
  fullName: string;
  username: string;
  bio: string;
  location: string;
  avatar: File | null;
  removeAvatar: boolean;
  banner: File | null;
}

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser;
  pending: boolean;
  errorMessage: string | null;
  fieldErrors: Record<string, string>;
  onSubmit: (state: EditProfileFormState) => void;
}

interface PickedImage {
  file: File;
  url: string;
}

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  pending,
  errorMessage,
  fieldErrors,
  onSubmit,
}: EditProfileModalProps) {
  const { t } = useTranslation();
  // Radix unmounts the content on close, so everything re-seeds from the
  // fresh `user` at each open — no manual reset needed.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xs gap-0 overflow-hidden p-0"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {t("home.editProfile.title")}
        </DialogTitle>
        <EditProfileForm
          user={user}
          pending={pending}
          errorMessage={errorMessage}
          fieldErrors={fieldErrors}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditProfileForm({
  user,
  pending,
  errorMessage,
  fieldErrors,
  onSubmit,
}: Omit<EditProfileModalProps, "open" | "onOpenChange">) {
  const { t } = useTranslation();
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatar, setAvatar] = useState<PickedImage | null>(null);
  const [banner, setBanner] = useState<PickedImage | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // revoke each preview URL when replaced, and on unmount
  useEffect(() => {
    return () => {
      if (avatar) URL.revokeObjectURL(avatar.url);
    };
  }, [avatar]);
  useEffect(() => {
    return () => {
      if (banner) URL.revokeObjectURL(banner.url);
    };
  }, [banner]);

  const pick =
    (setter: (image: PickedImage) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) setter({ file, url: URL.createObjectURL(file) });
      // else the webview won't fire change when re-picking the same file
      event.target.value = "";
    };

  const bannerSrc = banner?.url ?? user.bannerUrl;
  const avatarSrc = removeAvatar ? null : (avatar?.url ?? user.avatarUrl);
  const usernameIssue = fieldErrors.username ?? usernameError;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const username = String(form.get("username") ?? "").trim();
        if (!username) {
          setUsernameError(t("home.editProfile.usernameEmpty"));
          return;
        }
        setUsernameError(null);
        onSubmit({
          fullName: String(form.get("fullName") ?? "").trim(),
          username,
          bio: bio.trim(),
          location: String(form.get("location") ?? "").trim(),
          avatar: avatar?.file ?? null,
          removeAvatar,
          banner: banner?.file ?? null,
        });
      }}
    >
      {/* banner: current image (or flat surface) with an import pill */}
      <div className="bg-foreground/[0.04] relative h-28">
        {bannerSrc && (
          <img
            src={bannerSrc}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <label className="flex h-7 cursor-pointer items-center gap-1.5 rounded-full bg-black/50 px-2.5 text-xs font-medium text-white transition-colors hover:bg-black/65">
            <Upload aria-hidden="true" className="size-3.5" />
            {t("home.editProfile.import")}
            <input
              type="file"
              name="banner"
              accept={ACCEPTED_IMAGES}
              className="sr-only"
              onChange={pick(setBanner)}
            />
          </label>
        </div>
      </div>

      <div className="px-4">
        <div className="relative -mt-9 w-fit">
          <Avatar className="ring-card size-18 ring-4">
            <AvatarImage src={avatarSrc ?? undefined} alt="" />
            <AvatarFallback className="text-xl">{user.initials}</AvatarFallback>
          </Avatar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t("home.editProfile.editPhoto")}
                className="bg-secondary text-secondary-foreground ring-card hover:bg-accent absolute -right-0.5 -bottom-0.5 flex size-7 items-center justify-center rounded-full ring-2 transition-colors"
              >
                <Pencil aria-hidden="true" className="size-3" />
              </button>
            </DropdownMenuTrigger>
            {/* above the dialog surface (z-80) */}
            <DropdownMenuContent
              align="start"
              sideOffset={6}
              className="z-[90] min-w-36"
            >
              <DropdownMenuItem
                onSelect={() => avatarInputRef.current?.click()}
              >
                <Upload />
                {t("home.editProfile.changePhoto")}
              </DropdownMenuItem>
              {avatarSrc && (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    setAvatar(null);
                    setRemoveAvatar(true);
                  }}
                >
                  <Trash2 />
                  {t("home.editProfile.removePhoto")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={avatarInputRef}
            type="file"
            name="avatar"
            accept={ACCEPTED_IMAGES}
            className="sr-only"
            onChange={(event) => {
              setRemoveAvatar(false);
              pick(setAvatar)(event);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName" className="text-muted-foreground text-xs">
            {t("home.editProfile.name")}
          </Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={user.fullName ?? ""}
            placeholder={t("home.editProfile.namePlaceholder")}
            maxLength={100}
            className="h-8"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="username" className="text-muted-foreground text-xs">
            {t("home.editProfile.username")}
          </Label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm"
            >
              @
            </span>
            <Input
              id="username"
              name="username"
              defaultValue={user.username ?? ""}
              placeholder={t("home.editProfile.usernamePlaceholder")}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={usernameIssue ? true : undefined}
              className="h-8 pl-7 lowercase"
            />
          </div>
          {usernameIssue ? (
            <p className="text-destructive text-xs" role="alert">
              {usernameIssue}
            </p>
          ) : (
            <p className="text-muted-foreground/70 text-xs">
              {t("home.editProfile.usernameHelp")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="bio" className="text-muted-foreground text-xs">
              {t("home.editProfile.bio")}
            </Label>
            <span className="text-muted-foreground/70 text-[11px] tabular-nums">
              {t("home.editProfile.bioCounter", {
                length: bio.length,
                max: BIO_MAX,
              })}
            </span>
          </div>
          <Textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder={t("home.editProfile.bioPlaceholder")}
            maxLength={BIO_MAX}
            rows={2}
            className="resize-none"
            aria-invalid={fieldErrors.bio ? true : undefined}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="location" className="text-muted-foreground text-xs">
            {t("home.editProfile.location")}
          </Label>
          <div className="relative">
            <MapPin
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
            />
            <Input
              id="location"
              name="location"
              defaultValue={user.location ?? ""}
              placeholder={t("home.editProfile.locationPlaceholder")}
              maxLength={100}
              className="h-8 pl-8"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 px-4 py-3.5">
        <DialogClose asChild>
          <Button type="button" variant="secondary" size="sm">
            {t("common.cancel")}
          </Button>
        </DialogClose>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? t("home.editProfile.saving") : t("home.editProfile.save")}
        </Button>
      </div>
    </form>
  );
}
