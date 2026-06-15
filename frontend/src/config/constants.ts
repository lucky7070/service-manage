import type { LucideIcon } from "lucide-react";
import { Calendar, CreditCard, FileCheck, IndianRupee, Shield, Smartphone, Star, TrendingUp, User, UserCheck, Users, Clock3, Search, ShieldCheck, ThumbsUp } from "lucide-react";

export type JoinProBenefit = {
    icon: LucideIcon;
    title: string;
    description: string;
};

export type JoinProTestimonial = {
    name: string;
    service: string;
    earnings: string;
    text: string;
    rating: number;
};

export const PLATFORM_MARKETING = {
    happyCustomersFormatted: "50,000+",
    happyCustomersShort: "50K+",

    /** Hero badge copy */
    happyCustomersTrustedByHomeowners: "Trusted by 50,000+ homeowners",
    verifiedProfessionalsFormatted: "10,000+",
    verifiedProfessionalsShort: "10K+",
    averageRating: 4.8,
    averageRatingOutOfFive: "4.8/5",

    /** Numeric headline (floating cards, login, safety trust score) */
    averageRatingHeadline: "4.8",
    reviewsSubtitle: "50K+ Reviews",
    verifiedProsCaption: "Verified Pros",
    verifiedProsBadgePercent: "100%",
    avgResponseFormatted: "30 min",

    /** safety / trust secondary stat */
    safeServiceVisitsFormatted: "500K+",
} as const;

export const JOIN_PRO_BENEFITS: JoinProBenefit[] = [
    {
        icon: TrendingUp,
        title: "Grow Your Business",
        description: `Access ${PLATFORM_MARKETING.happyCustomersShort} homeowners looking for your services every day`
    },
    {
        icon: Calendar,
        title: "Flexible Schedule",
        description: "Accept jobs that fit your schedule. Work when you want"
    },
    {
        icon: IndianRupee,
        title: "Earn More",
        description: "Top pros earn Rs. 50,000+ monthly with competitive pricing"
    },
    {
        icon: Shield,
        title: "Secure Payments",
        description: "Get paid directly to your bank account within 24 hours"
    },
    {
        icon: Smartphone,
        title: "Easy-to-use App",
        description: "Manage bookings, track earnings, and chat with customers"
    },
    {
        icon: Users,
        title: "Training & Support",
        description: "Free training programs and 24/7 partner support"
    }
];


// --- Frontend login ---
export const FRONTEND_LOGIN_BRAND = {
    mark: "S",
    name: "Serva Services"
} as const;

export const FRONTEND_LOGIN_HERO = {
    headline: "Your trusted partner for all home services",
    subline: `Join ${PLATFORM_MARKETING.happyCustomersShort} happy customers who trust us with their homes`,
    footer: `Trusted by ${PLATFORM_MARKETING.happyCustomersFormatted} homeowners across India`,
} as const;

export const FRONTEND_LOGIN_STATS = [
    { value: PLATFORM_MARKETING.happyCustomersShort, label: "Happy Customers" },
    { value: PLATFORM_MARKETING.verifiedProfessionalsShort, label: "Verified Pros" },
    { value: PLATFORM_MARKETING.averageRatingHeadline, label: "Average Rating" },
] as const;

export const FRONTEND_LOGIN_FORM = {
    welcomeBack: "Welcome back",
    createAccount: "Create account",
    enterCredentials: "Enter your credentials to access your account",
    fillDetails: "Fill in your details to get started",
    loginTab: "Login",
    signUpTab: "Sign Up",
    noAccount: "Don't have an account? ",
    hasAccount: "Already have an account? ",
    signUpLink: "Sign up",
    signInLink: "Sign in",
    backToHome: "Back to home"
} as const;

export const FOOTER_LINKS: Array<{ label: string, list: Array<{ name: string, href: string }> }> = [
    {
        label: "Services",
        list: [
            { name: "Cleaning Services", href: "/services/cleaning" },
            { name: "Electrician", href: "/services/electrician" },
            { name: "Plumber", href: "/services/plumber" },
            { name: "Painting", href: "/services/painting" },
            { name: "Home Renovation", href: "/services/home-renovation" },
            { name: "Air Conditioner Repair", href: "/services/air-conditioner-repair" },
        ]
    },
    {
        label: "Company",
        list: [
            { name: "About Us", href: "/about" },
            { name: "Terms and Conditions", href: "/terms-and-conditions" },
            { name: "Privacy Policy", href: "/privacy-policy" },
            { name: "Partner with Us", href: "/join-pro" },
        ]
    },
    {
        label: "Support",
        list: [
            { name: "Help Center", href: "/help" },
            { name: "Safety", href: "/safety" },
            { name: "Contact Us", href: "/contact-us" },
        ]
    },
]

export const VERIFICATION_STEPS: Array<{ icon: LucideIcon, title: string, description: string }> = [
    {
        icon: FileCheck,
        title: "Document Verification",
        description: "We verify government-issued IDs, address proof, and professional certifications of all service providers.",
    },
    {
        icon: UserCheck,
        title: "Background Check",
        description: "Comprehensive criminal background checks are conducted through authorized agencies before onboarding.",
    },
    {
        icon: Star,
        title: "Skill Assessment",
        description: "Professionals undergo skill tests and training to ensure they meet our quality standards.",
    },
    {
        icon: Shield,
        title: "Insurance Coverage",
        description: "All professionals are covered by liability insurance to protect you and your property.",
    },
]

export const SAFETY_FEATURES: string[] = [
    "Real-time GPS tracking of service visits",
    "OTP verification before service begins",
    "In-app emergency SOS button",
    "Live photo capture during service",
    "24/7 customer support hotline",
]

export const ARTICLE_CATEGORIES: Array<{ icon: LucideIcon, title: string, description: string, articles: number, href: string }> = [
    {
        icon: Calendar,
        title: "Booking & Scheduling",
        description: "How to book, reschedule, or cancel services",
        articles: 12,
        href: "#",
    },
    {
        icon: CreditCard,
        title: "Payments & Refunds",
        description: "Payment methods, invoices, and refund policies",
        articles: 8,
        href: "#",
    },
    {
        icon: Shield,
        title: "Safety & Trust",
        description: "Background checks, insurance, and guarantees",
        articles: 6,
        href: "#",
    },
    {
        icon: User,
        title: "Account Settings",
        description: "Profile, notifications, and preferences",
        articles: 10,
        href: "#",
    },
]

export const POPULAR_ARTICLES: Array<{ title: string, href: string }> = [];



export const JOIN_PRO_HERO_SECONDARY_LEAD = `Join ${PLATFORM_MARKETING.verifiedProfessionalsFormatted} professionals earning more with ${FRONTEND_LOGIN_BRAND.name}.`;
export const JOIN_PRO_CTA_SUBLINE = `Join ${PLATFORM_MARKETING.verifiedProfessionalsFormatted} professionals who are growing their business with ${FRONTEND_LOGIN_BRAND.name}`;

export type FeaturedProviderPersona = {
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    experience: string;
    initials: string;
    jobs: string;
    color: string;
};

/** Canonical static provider personas — use everywhere (home grid, fallback copy, join-pro samples). */
export const FEATURED_PROVIDERS: FeaturedProviderPersona[] = [
    {
        name: "Rajesh Kumar",
        specialty: "Electrician",
        rating: 4.9,
        reviews: 234,
        experience: "8 years",
        initials: "RK",
        jobs: "1.2K+",
        color: "bg-amber-500",
    },
    {
        name: "Priya Sharma",
        specialty: "House Cleaning",
        rating: 4.8,
        reviews: 189,
        experience: "5 years",
        initials: "PS",
        jobs: "890+",
        color: "bg-blue-500",
    },
    {
        name: "Mohammed Ali",
        specialty: "Plumber",
        rating: 4.9,
        reviews: 312,
        experience: "10 years",
        initials: "MA",
        jobs: "2.1K+",
        color: "bg-cyan-500",
    },
    {
        name: "Anita Desai",
        specialty: "Painter",
        rating: 4.7,
        reviews: 156,
        experience: "6 years",
        initials: "AD",
        jobs: "650+",
        color: "bg-rose-500",
    },
];

export type HomeHeroStat = {
    icon: LucideIcon;
    value: string;
    label: string;
};

export const HOME_HERO_STATS: HomeHeroStat[] = [
    { icon: Users, value: PLATFORM_MARKETING.happyCustomersFormatted, label: "Happy Customers" },
    { icon: ShieldCheck, value: PLATFORM_MARKETING.verifiedProfessionalsFormatted, label: "Verified Pros" },
    { icon: Star, value: PLATFORM_MARKETING.averageRatingOutOfFive, label: "Average Rating" },
    { icon: Clock3, value: PLATFORM_MARKETING.avgResponseFormatted, label: "Avg Response" },
];

export const HOME_CTA_BENEFITS = [
    `${PLATFORM_MARKETING.verifiedProfessionalsFormatted} Verified Professionals`,
    "100% Satisfaction Guarantee",
    "Best Price Assurance",
    "24/7 Customer Support",
] as const;

export const HOME_CTA_SOCIAL_PROOF = `${PLATFORM_MARKETING.happyCustomersFormatted} homeowners trust HomeServe Pro for their home service needs`;

export type HomeHowItWorksStep = {
    icon: LucideIcon;
    title: string;
    description: string;
    step: number;
    color: string;
};

export const HOME_HOW_IT_WORKS_STEPS: HomeHowItWorksStep[] = [
    {
        icon: Search,
        title: "Search Service Provider",
        description:
            "Browse our wide range of home services and find exactly what you need",
        step: 1,
        color: "bg-blue-500",
    },
    {
        icon: UserCheck,
        title: "Choose a Pro",
        description:
            "Compare verified professionals, read reviews and select the best fit",
        step: 2,
        color: "bg-emerald-500",
    },
    {
        icon: Calendar,
        title: "Book Appointment",
        description:
            "Schedule at your convenience with flexible timing options",
        step: 3,
        color: "bg-primary",
    },
    {
        icon: ThumbsUp,
        title: "Relax & Rate",
        description:
            "Our experts complete the job, then share your experience",
        step: 4,
        color: "bg-rose-500",
    },
];

export const CUSTOMER_TESTIMONIAL_SECTION_TRUST_LINE = `Trusted by over ${PLATFORM_MARKETING.happyCustomersFormatted} happy customers across India`;

