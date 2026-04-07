"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import LoginOtpForm from "@/components/front/auth/LoginOtpForm"
import RegisterOtpForm from "@/components/front/auth/RegisterOtpForm"

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="flex min-h-screen">
            <div className="hidden w-1/2 bg-linear-to-br from-primary/90 to-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
                <Link href="/" className="flex items-center gap-2 text-primary-foreground">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
                        <span className="text-lg font-bold">H</span>
                    </div>
                    <span className="text-2xl font-bold">HomeServe Pro</span>
                </Link>

                <div className="space-y-6">
                    <h1 className="text-4xl font-bold leading-tight text-primary-foreground">
                        Your trusted partner for all home services
                    </h1>
                    <p className="text-lg text-primary-foreground/80">
                        Join thousands of happy customers who trust us with their homes
                    </p>
                    <div className="flex gap-8">
                        <div>
                            <div className="text-3xl font-bold text-primary-foreground">50K+</div>
                            <div className="text-sm text-primary-foreground/70">Happy Customers</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-foreground">10K+</div>
                            <div className="text-sm text-primary-foreground/70">Verified Pros</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-foreground">4.8</div>
                            <div className="text-sm text-primary-foreground/70">Average Rating</div>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-primary-foreground/60">
                    Trusted by homeowners across India
                </p>
            </div>

            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
                <div className="mb-8 lg:hidden">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-foreground">
                            {isLogin ? "Welcome back" : "Create account"}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {isLogin ? "Enter your credentials to access your account" : "Fill in your details to get started"}
                        </p>
                    </div>

                    <div className="mb-6 flex rounded-lg bg-secondary p-1">
                        <button onClick={() => setIsLogin(true)} className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            Login
                        </button>
                        <button onClick={() => setIsLogin(false)} className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${!isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            Sign Up
                        </button>
                    </div>

                    {isLogin ? <LoginOtpForm /> : <RegisterOtpForm />}
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Link href="/login" onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary hover:underline">
                            {isLogin ? "Sign up" : "Sign in"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
