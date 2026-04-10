"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import LoginOtpForm from "@/components/front/forms/LoginForm"
import RegisterOtpForm from "@/components/front/forms/RegisterForm"
import {
    FRONTEND_LOGIN_BRAND,
    FRONTEND_LOGIN_FORM,
    FRONTEND_LOGIN_HERO,
    FRONTEND_LOGIN_STATS
} from "@/config/constants"

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="flex min-h-screen">
            <div className="hidden w-1/2 bg-linear-to-br from-primary/90 to-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
                <Link href="/" className="flex items-center gap-2 text-primary-foreground">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
                        <span className="text-lg font-bold">{FRONTEND_LOGIN_BRAND.mark}</span>
                    </div>
                    <span className="text-2xl font-bold">{FRONTEND_LOGIN_BRAND.name}</span>
                </Link>

                <div className="space-y-6">
                    <h1 className="text-4xl font-bold leading-tight text-primary-foreground">
                        {FRONTEND_LOGIN_HERO.headline}
                    </h1>
                    <p className="text-lg text-primary-foreground/80">
                        {FRONTEND_LOGIN_HERO.subline}
                    </p>
                    <div className="flex gap-8">
                        {FRONTEND_LOGIN_STATS.map((stat) => (
                            <div key={stat.label}>
                                <div className="text-3xl font-bold text-primary-foreground">{stat.value}</div>
                                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-primary-foreground/60">
                    {FRONTEND_LOGIN_HERO.footer}
                </p>
            </div>

            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
                <div className="mb-8 lg:hidden">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        {FRONTEND_LOGIN_FORM.backToHome}
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-foreground">
                            {isLogin ? FRONTEND_LOGIN_FORM.welcomeBack : FRONTEND_LOGIN_FORM.createAccount}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {isLogin ? FRONTEND_LOGIN_FORM.enterCredentials : FRONTEND_LOGIN_FORM.fillDetails}
                        </p>
                    </div>

                    <div className="mb-6 flex rounded-lg bg-secondary p-1">
                        <button onClick={() => setIsLogin(true)} className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            {FRONTEND_LOGIN_FORM.loginTab}
                        </button>
                        <button onClick={() => setIsLogin(false)} className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${!isLogin ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            {FRONTEND_LOGIN_FORM.signUpTab}
                        </button>
                    </div>

                    {isLogin ? <LoginOtpForm /> : <RegisterOtpForm />}
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        {isLogin ? FRONTEND_LOGIN_FORM.noAccount : FRONTEND_LOGIN_FORM.hasAccount}
                        <Link href="/login" onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary hover:underline">
                            {isLogin ? FRONTEND_LOGIN_FORM.signUpLink : FRONTEND_LOGIN_FORM.signInLink}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
