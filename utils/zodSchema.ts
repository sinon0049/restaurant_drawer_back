import * as z from 'zod'

const NameSchema = z
    .string('Name must be a string.').trim()
    .min(1, 'Name is required.')
const PasswordSchema = z
    .string('Password must be a string.')
    .min(1, 'Password is required.')
const EmailSchema = z
    .email('Invalid email format.')

export const UpdateProfileDataSchema = z.object({
    email: EmailSchema.optional(),
    name: NameSchema.optional()
})

export const UpdatePasswordDataSchema = z.object({
    currentPassword: PasswordSchema,
    newPassword: PasswordSchema,
    confirmPassword: PasswordSchema
})

export const SignInSchema = z.object({
    email: EmailSchema,
    password: PasswordSchema,
})

export const SignUpSchema = z.object({
    email: EmailSchema,
    name: NameSchema,
    confirmPassword: PasswordSchema,
    password: PasswordSchema,
})

export const DrawRestaurantDataSchema = z.object({
    location: z.object({
        lng: z.number('Longitude must be a number').min(-180, 'Longitude must be between -180 and 180.').max(180, 'Longitude must be between -180 and 180.'),
        lat: z.number('Latitude must be a number').min(-90, 'Latitude must be between -90 and 90.').max(90, 'Latitude must be between -90 and 90.'),
    }),
    radius: z.number().min(1, 'Radius can not be smaller than 0.')
})