"use client"

import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup";
import { Label, Input, Textarea, Button } from "@/components/front/ui"
import { Send } from "lucide-react"
import AxiosHelper from "@/helpers/AxiosHelper"
import { toast } from "react-toastify"
import { PHONE_ERROR_MESSAGE, PHONE_REGEXP } from "@/config";

const contactEnquirySchema = Yup.object({
    name: Yup.string()
        .trim()
        .min(2, "Name must be at least 2 characters.")
        .max(100, "Name must be at most 100 characters.")
        .required("Name is required."),
    email: Yup.string()
        .trim()
        .email("Enter a valid email address.")
        .max(100, "Email must be at most 100 characters.")
        .required("Email is required."),
    phone: Yup.string()
        .trim()
        .max(10, "Phone must be at most 10 characters.")
        .required("Phone is required.")
        .test("phone", PHONE_ERROR_MESSAGE, (value) => !value || PHONE_REGEXP.test(value)),
    subject: Yup.string()
        .trim()
        .min(2, "Subject must be at least 2 characters.")
        .max(200, "Subject must be at most 200 characters.")
        .required("Subject is required."),
    message: Yup.string()
        .trim()
        .min(10, "Please enter at least 10 characters.")
        .max(5000, "Message must be at most 5000 characters.")
        .required("Message is required."),
})


const ContactUs = () => {
    return <div>
        <h2 className="mb-6 text-2xl font-bold text-foreground">Send us a Message</h2>
        <Formik<{ name: string; email: string; phone: string; subject: string; message: string; }>
            initialValues={{ name: "", email: "", phone: "", subject: "", message: "" }}
            validationSchema={contactEnquirySchema}
            validateOnBlur
            validateOnChange={false}
            onSubmit={async (values, { resetForm, setErrors, setSubmitting }) => {
                const payload = {
                    name: values.name.trim(),
                    email: values.email.trim(),
                    phone: values.phone.trim() || undefined,
                    subject: values.subject.trim(),
                    message: values.message.trim(),
                }
                const { data } = await AxiosHelper.postData("/enquiries", payload)
                if (data.status) {
                    toast.success(data.message || "Message sent successfully.")
                    resetForm()
                } else {
                    setErrors(data.data);
                    toast.error(data.message || "Could not send your message. Please try again.")
                }
                setSubmitting(false)
            }}
        >
            {({ isSubmitting }) => (
                <Form className="space-y-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="contact-name" required>
                                Name
                            </Label>
                            <Field
                                as={Input}
                                id="contact-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Your name"
                                disabled={isSubmitting}
                            />
                            <ErrorMessage name="name" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label htmlFor="contact-email" required>
                                Email
                            </Label>
                            <Field
                                as={Input}
                                id="contact-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="your@email.com"
                                disabled={isSubmitting}
                            />
                            <ErrorMessage name="email" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="contact-phone">
                                Phone <span className="font-normal text-muted-foreground">(optional)</span>
                            </Label>
                            <Field
                                as={Input}
                                id="contact-phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder="9876543210"
                                maxLength={10}
                                disabled={isSubmitting}
                            />
                            <ErrorMessage name="phone" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                        <div>
                            <Label htmlFor="contact-subject" required>
                                Subject
                            </Label>
                            <Field
                                as={Input}
                                id="contact-subject"
                                name="subject"
                                type="text"
                                placeholder="How can we help?"
                                disabled={isSubmitting}
                            />
                            <ErrorMessage name="subject" component="small" className="mt-1 block text-xs text-rose-600" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="contact-message" required>
                            Message
                        </Label>
                        <Field
                            as={Textarea}
                            id="contact-message"
                            name="message"
                            rows={5}
                            placeholder="Tell us more about your inquiry..."
                            disabled={isSubmitting}
                            className="min-h-[120px] py-3 leading-normal"
                        />
                        <ErrorMessage name="message" component="small" className="mt-1 block text-xs text-rose-600" />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Sending…" : "Send Message"}
                    </Button>
                </Form>
            )}
        </Formik>
    </div>
}

export default ContactUs