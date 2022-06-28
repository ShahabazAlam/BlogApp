import { TextInput, Checkbox, Button, Group, Container, Title, Paper, PasswordInput, Anchor, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { axios } from '../components/Axios/axios'
import { clearUserToken, isLoggedIn, setUserToken } from '../components/Token/tokenAction';

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [credential_error, setCredentialError] = useState("")

    const router = useRouter();
    useEffect(() => {
        // redirect to login if user is not authenticated
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
        if (logged_in) router.push('/');
    }, []);

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        },

        validate: {
            email: (value) => (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value) ? null : 'Invalid email'),
            password: (value) => (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(value) ? null : 'Password should contain atleast one number and one special character'),
        },
    });

    async function handleSubmit() {
        setCredentialError("")
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        try {
            const res = await axios.post('user/login', formData)
            if (res.data.error) {
                setCredentialError(res.data.data)
            } else {
                setUserToken(res.data.access_token);
                router.push('/')
            }
        } catch (e) {
            clearUserToken()
            if (e.response && e.response.data) setCredentialError(e.response.data.detail)
            else setCredentialError('Something went wrong.')
        }
    }

    return (
        <>
            <Container size={420} my={40}>
                <Title
                    align="center"
                    sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
                >
                    Log-In
                </Title>
                <Text color="dimmed" size="sm" align="center" mt={5}>
                    Do not have an account yet?{' '}
                    <Anchor href="/signup" size="sm" >
                        Create account
                    </Anchor>
                </Text>
                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    {credential_error && <p style={{ color: 'red', textAlign: 'center' }}>{credential_error}</p>}
                    <form onSubmit={form.onSubmit(() => handleSubmit())} >
                        <TextInput
                            onKeyUp={(event) => setEmail(event.currentTarget.value)}
                            required
                            label="Email"
                            placeholder="your@email.com"
                            {...form.getInputProps('email')}
                        />
                        <PasswordInput label="Password" placeholder="Your password" required mt="md" onKeyUp={(event) => setPassword(event.currentTarget.value)}
                            {...form.getInputProps('password')} />
                        <Group position="apart" mt="md">
                            <Checkbox label="Remember me" />
                        </Group>
                        <Button type='submit' fullWidth mt="xl">
                            Sign in
                        </Button>
                    </form>
                </Paper>
            </Container >
        </>
    );
}