'use server'
import { cookies } from 'next/headers'
import envConfig from '@/config/env'

export async function deleteFranchiseAuthCookie() {
    const cookieStore = await cookies()
    if (!cookieStore.get('franchise_token')) return

    const domain = envConfig.authCookieDomain
    if (domain) {
        cookieStore.delete({ name: 'franchise_token', path: '/', domain })
    } else {
        cookieStore.delete('franchise_token')
    }
}
