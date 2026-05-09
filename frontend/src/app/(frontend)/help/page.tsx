import Link from "next/link"
import { Input } from "@/components/front/ui"
import { Search, ChevronRight } from "lucide-react"
import ContactSupport from "@/components/front/ContactSupport"
import { ARTICLE_CATEGORIES, POPULAR_ARTICLES } from "@/config/constants"

export default function HelpPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-linear-to-b from-secondary/80 to-background py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            How can we help you?
                        </h1>
                        <p className="mb-8 text-lg text-muted-foreground">
                            Search our knowledge base or browse categories below
                        </p>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search for answers..."
                                className="h-14 pl-12 text-base"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            {ARTICLE_CATEGORIES.length > 0 && <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="mb-8 text-2xl font-bold text-foreground">Browse by Category</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {ARTICLE_CATEGORIES.map((category) => (
                            <Link
                                key={category.title}
                                href={category.href}
                                className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <category.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary">{category.title}</h3>
                                <p className="mb-3 text-sm text-muted-foreground">{category.description}</p>
                                <span className="text-xs text-primary">{category.articles} articles</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>}

            {/* Popular Articles */}
            {POPULAR_ARTICLES.length > 0 && <section className="bg-secondary/50 py-16">
                <div className="container mx-auto px-4">
                    <h2 className="mb-8 text-2xl font-bold text-foreground">Popular Articles</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {POPULAR_ARTICLES.map((article) => (
                            <Link
                                key={article.title}
                                href={article.href}
                                className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:border-primary/20"
                            >
                                <span className="text-foreground group-hover:text-primary">{article.title}</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>}

            {/* Contact Support */}
            <ContactSupport />
        </>
    )
}
