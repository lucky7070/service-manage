import AxiosHelper from "@/helpers/AxiosHelper";
import { notFound } from "next/navigation";
import moment from "moment";
import { cache } from 'react'
import ContactBox from "@/components/front/contact-box";

const getData = cache(async () => {
    try {
        const { data } = await AxiosHelper.getData("/terms-and-conditions");
        console.log(data);
        if (!data.status || !data.data) return notFound();

        return data.data;
    } catch {
        return notFound();
    }
})

export async function generateMetadata() {
    const data = await getData();
    return { title: data.pageTitle || "Terms and Conditions", description: data.metaDescription || "", }
}

export default async function PrivacyPolicyPage() {

    const data = await getData();
    return <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                {data.title}
            </h1>
            <p className="mb-8 text-muted-foreground">
                Last updated: {data.updatedAt ? moment(data.updatedAt).format("DD MMM YYYY") : "N/A"}
            </p>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                {data.content && <div className="space-y-8" dangerouslySetInnerHTML={{ __html: data.content }} />}
                <ContactBox title="Contact Us" content="If you have questions about this privacy policy or our data practices, please contact us at:" />
            </div>
        </div>
    </div>
}