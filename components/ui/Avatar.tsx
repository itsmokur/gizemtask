interface AvatarProps {
  name: string;
  photoURL?: string | null;
  size?: "sm" | "md" | "lg";
}

const SIZE_STYLES = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

// Generate a color from the user's name
function nameToColor(name: string): string {
  const colors = [
    "bg-violet-600",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-amber-600",
    "bg-cyan-600",
  ];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
}

export function Avatar({ name, photoURL, size = "md" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={name}
        className={`${SIZE_STYLES[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${SIZE_STYLES[size]} ${nameToColor(name)} rounded-full flex items-center justify-center text-white font-semibold select-none`}
    >
      {initials}
    </div>
  );
}
