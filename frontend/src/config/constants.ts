import type { LucideIcon } from "lucide-react";
import { Calendar, IndianRupee, Shield, Smartphone, TrendingUp, Users, } from "lucide-react";

export type JoinProBenefit = {
    icon: LucideIcon;
    title: string;
    description: string;
};

export const JOIN_PRO_BENEFITS: JoinProBenefit[] = [
    {
        icon: TrendingUp,
        title: "Grow Your Business",
        description: "Access thousands of customers looking for your services every day"
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

export type JoinProTestimonial = {
    name: string;
    service: string;
    earnings: string;
    text: string;
    rating: number;
};

export const JOIN_PRO_TESTIMONIALS: JoinProTestimonial[] = [
    {
        name: "Suresh Electricals",
        service: "Electrician",
        earnings: "Rs. 65,000/month",
        text: "Joining HomeServe Pro was the best decision. I get consistent work and my income has doubled.",
        rating: 4.9
    },
    {
        name: "Neha Cleaning Services",
        service: "House Cleaning",
        earnings: "Rs. 45,000/month",
        text: "The platform is so easy to use. I manage my own schedule and the payments are always on time.",
        rating: 4.8
    }
];

// --- Frontend login ---
export const FRONTEND_LOGIN_BRAND = {
    mark: "H",
    name: "HomeServe Pro"
} as const;

export const FRONTEND_LOGIN_HERO = {
    headline: "Your trusted partner for all home services",
    subline: "Join thousands of happy customers who trust us with their homes",
    footer: "Trusted by homeowners across India"
} as const;

export const FRONTEND_LOGIN_STATS = [
    { value: "50K+", label: "Happy Customers" },
    { value: "10K+", label: "Verified Pros" },
    { value: "4.8", label: "Average Rating" }
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


export const FOOTER_LINKS = [
    {
        label: "Services",
        list: [
            { name: "Cleaning Services", href: "/services/cleaning" },
            { name: "Electrical", href: "/services/electrical" },
            { name: "Plumbing", href: "/services/plumbing" },
            { name: "Painting", href: "/services/painting" },
            { name: "Handyman", href: "/services/handyman" },
            { name: "Appliance Repair", href: "/services/appliance-repair" },
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