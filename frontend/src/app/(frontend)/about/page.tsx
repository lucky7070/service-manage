import { getAboutContent } from "@/lib/api.server"
import { CheckCircle, Building, ImageIcon } from "lucide-react"
import { resolveFileUrl } from "@/helpers/utils";
import Image from "@/components/ui/Image";

export default async function AboutPage() {
    const { ourStory, values, milestones } = await getAboutContent();
    return (
        <>
            <section className="bg-linear-to-b from-secondary/80 to-background py-20 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">About Us</span>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            Making Home Services <span className="text-primary">Simple & Reliable</span>
                        </h1>
                        <p className="text-lg text-muted-foreground md:text-xl">
                            We&apos;re on a mission to transform how India experiences home services -
                            connecting homeowners with trusted professionals for every need.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="pb-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-8 flex items-center gap-3">
                            <Building className="h-8 w-8 text-primary" />
                            <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
                        </div>
                        <div className="text-muted-foreground">
                            <div className="space-y-4" dangerouslySetInnerHTML={{ __html: ourStory || "No content available." }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="bg-secondary/50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-14 text-center">
                        <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">What We Stand For</span>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Our Values</h2>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {values.length > 0 ? (
                            values.map((value) => {
                                const iconUrl = resolveFileUrl(value.icon);
                                return <div key={value.title} className="rounded-2xl border bg-card p-6">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        {iconUrl ? (
                                            <Image src={iconUrl} alt={`${value.title} icon`} className="h-6 w-6 object-contain" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-primary" />
                                        )}
                                    </div>
                                    <h3 className="mb-2 font-semibold text-foreground">{value.title}</h3>
                                    <p className="text-sm text-muted-foreground">{value.description}</p>
                                </div>
                            })
                        ) : (
                            <p className="col-span-full py-8 text-center text-muted-foreground">
                                Our values are not available at the moment.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-14 text-center">
                        <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">Our Journey</span>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Milestones</h2>
                    </div>
                    <div className="mx-auto max-w-2xl">
                        <div className="space-y-6">
                            {milestones.length > 0 ? (
                                milestones.map((milestone, index) => (
                                    <div key={`${milestone.year}-${index}`} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                            {index < milestones.length - 1 && (
                                                <div className="h-full w-0.5 bg-border" />
                                            )}
                                        </div>
                                        <div className="pb-6">
                                            <span className="text-sm font-semibold text-primary">{milestone.year}</span>
                                            <p className="text-foreground">{milestone.event}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-8 text-center text-muted-foreground">
                                    Milestones are not available at the moment.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
