export const colors = {
    background: "#FCFCFC",
    foreground: "#262626",
    card: "#FFFFFF",
    primary: "#F0741A",
    primaryDark: "#EA580C",
    primaryForeground: "#FFFFFF",
    secondary: "#F4F3EF",
    secondaryForeground: "#404040",
    muted: "#F4F4F3",
    mutedForeground: "#808080",
    border: "#E8E7E6",
    destructive: "#E5484D",
    rose: "#E11D48",
    emerald: "#047857",
    amber: "#B45309",
    amberBg: "#FFFBEB",
    amberRing: "#FDE68A",
    orange50: "#FFF7ED",
    orange100: "#FFEDD5",
    gray600: "#4B5563",
    gray900: "#111827",
    white: "#FFFFFF",
};

export const radius = {
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
    x2: 24,
    x3: 28,
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    x2: 32,
};

export const shadows = {
    card: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    primaryButton: {
        shadowColor: "#F0741A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
};

export const typography = {
    hero: { fontSize: 28, fontWeight: "800" as const, lineHeight: 34 },
    title: { fontSize: 22, fontWeight: "800" as const, lineHeight: 28 },
    subtitle: { fontSize: 15, fontWeight: "600" as const, lineHeight: 22 },
    body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },
    label: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.8, textTransform: "uppercase" as const },
    stat: { fontSize: 26, fontWeight: "800" as const, lineHeight: 30 },
};
