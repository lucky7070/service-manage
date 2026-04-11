'use server'
import { cookies } from 'next/headers'

export async function deleteAuthCookie() {
    const cookieStore = await cookies()
    if (cookieStore.get('admin_token')) cookieStore.delete('admin_token')
}