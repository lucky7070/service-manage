'use server'
import { cookies } from 'next/headers'
import envConfig from '@/config/env'

export async function deleteAuthCookie() {
    const cookieStore = await cookies()
    if (!cookieStore.get('admin_token')) return

    const domain = envConfig.authCookieDomain
    if (domain) {
        cookieStore.delete({ name: 'admin_token', path: '/', domain })
    } else {
        cookieStore.delete('admin_token')
    }
}

export async function deleteCustomerAuthCookie() {
    const cookieStore = await cookies()
    if (!cookieStore.get('customer_token')) return

    const domain = envConfig.authCookieDomain
    if (domain) {
        cookieStore.delete({ name: 'customer_token', path: '/', domain })
    } else {
        cookieStore.delete('customer_token')
    }
}