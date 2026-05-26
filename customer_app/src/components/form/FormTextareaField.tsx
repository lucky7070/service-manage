import type { ComponentProps } from "react";
import { Field, type FieldProps } from "formik";
import Textarea from "../ui/Textarea";

type FormTextareaFieldProps = Omit<ComponentProps<typeof Textarea>, "value" | "onChangeText" | "onBlur" | "error"> & {
    name: string;
};

export default function FormTextareaField({ name, ...props }: FormTextareaFieldProps) {
    return (
        <Field name={name}>
            {({ field, form, meta }: FieldProps<string>) => (
                <Textarea
                    {...props}
                    value={field.value ?? ""}
                    onChangeText={form.handleChange(name)}
                    onBlur={form.handleBlur(name)}
                    error={meta.touched && meta.error ? String(meta.error) : undefined}
                />
            )}
        </Field>
    );
}
