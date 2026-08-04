interface ProfileCardProps {
  fullName: string;
  email: string;
  initials: string;
  memberSince: string | null;
}

export function ProfileCard({
  fullName,
  email,
  initials,
  memberSince,
}: ProfileCardProps) {
  return (
    <section
      aria-label="Profile"
      className="bg-card w-56 shrink-0 rounded-xl p-5"
    >
      <div
        aria-hidden="true"
        className="bg-primary text-primary-foreground flex size-20 items-center justify-center rounded-full text-2xl font-semibold"
      >
        {initials}
      </div>
      <h1 className="mt-4 text-base font-semibold text-balance">{fullName}</h1>
      <p className="text-muted-foreground mt-0.5 text-sm break-all">{email}</p>
      {memberSince && (
        <>
          <div aria-hidden="true" className="bg-foreground/5 my-4 h-px" />
          <p className="text-muted-foreground text-xs">
            Member since {memberSince}
          </p>
        </>
      )}
    </section>
  );
}
