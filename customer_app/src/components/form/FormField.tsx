import type { ComponentProps } from "react";
import { Field, type FieldProps } from "formik";
import Input from "../ui/Input";

type FormFieldProps = Omit<ComponentProps<typeof Input>, "value" | "onChangeText" | "onBlur" | "error"> & {
    name: string;
};

export default function FormField({ name, ...props }: FormFieldProps) {
    return (
        <Field name={name}>
            {({ field, form, meta }: FieldProps<string>) => (
                <Input
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
