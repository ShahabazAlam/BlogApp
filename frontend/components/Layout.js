import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MyHeader from './Header'
import { isLoggedIn } from './Token/tokenAction';
import { axios } from './Axios/axios';
import Head from 'next/head';
export default function Layout({ children }) {
    const [loading, setLoading] = useState(true)
    const routers = useRouter()
    useEffect(() => {
        setLoading(true)
        let logged_in = true
        async function fetchData() {
            try {
                const res = await axios.get('/user/me/')
                if (!res.data) {
                    logged_in = false
                }
            } catch (e) {
                logged_in = false
            }
        }
        fetchData()
        let user = isLoggedIn()
        if (!user) {
            logged_in = false
        }
        if (!logged_in) {
            if (routers.pathname == '/signup') {
                routers.push('/signup')
            } else {
                routers.push('/login')
            }
        }
        setLoading(false)
    }, [])
    return (!loading ?
        <div>
            <Head>
                <title>MyBlog</title>
            </Head>
            {isLoggedIn() && <MyHeader />}
            <main>
                {children}
            </main>
        </div> : <h4>loading...</h4>)
}