import { TextInput, Checkbox, Button, Group, Container, Title, Paper, PasswordInput, Grid, Select, Notification } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { axios } from '../components/Axios/axios'
import { Check, X } from 'tabler-icons-react';
import Router from 'next/router'

export default function UserRegister() {
    const [email, setEmail] = useState("")
    const [first_name, setFirstName] = useState("")
    const [last_name, setLastName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setReenterPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const routers = useRouter()

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },

        validate: {
            confirmPassword: (value, values) => value !== values.password ? 'Passwords did not match' : null,
            email: (value) => (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value) ? null : 'Invalid email'),
            password: (value) => (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(value) ? null : 'Password should contain atleast one number and one special character'),
        },
    });

    async function handleSubmit() {
        setError("")
        try {
            const res = await axios.post('user/add', { 'password': password, 'first_name': first_name, 'last_name': last_name,'role_id':null, 'super_user': false, 'email': email })
            if(res.data.error){
                setError(res.data.data)
            }else{
                setSuccess(true)
                routers.push('/login')
            }
        } catch (e) {
            console.log(e)
            setError('Something went wrong.')
            // form.reset()
        }
    }

    function closeNotification() {
        setSuccess(false)
    }


    return (
        <Grid>
            <Grid.Col span={8} offset={2}>
                <Container size={800} my={40}>
                    {success &&
                        <Notification onClose={closeNotification} icon={<Check size={18} />} color="teal" title="Success!">
                            Created Successfully.
                        </Notification>
                    }
                    <Title
                        align="center"
                        sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
                    >
                        User Registration
                    </Title>
                    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                        <form onSubmit={form.onSubmit(() => handleSubmit())}>
                            <TextInput
                                onKeyUp={(event) => setFirstName(event.currentTarget.value)}
                                required
                                label="First Name"
                                placeholder="Enter First Name"
                                {...form.getInputProps('first_name')}
                            />
                            <TextInput
                                onKeyUp={(event) => setLastName(event.currentTarget.value)}
                                required
                                label="Last Name"
                                placeholder="Enter First Name"
                                {...form.getInputProps('last_name')}
                            />
                            <TextInput
                                onKeyUp={(event) => setEmail(event.currentTarget.value)}
                                required
                                label="Email"
                                placeholder="your@email.com"
                                {...form.getInputProps('email')}
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="Your password"
                                required mt="md"
                                onKeyUp={(event) => setPassword(event.currentTarget.value)}
                                {...form.getInputProps('password')}
                            />

                            <PasswordInput
                                label="Re-Enter Password"
                                placeholder="Your password"
                                required mt="md"
                                onKeyUp={(event) => setReenterPassword(event.currentTarget.value)}
                                {...form.getInputProps('confirmPassword')}
                            />

                            <Button type='submit' fullWidth mt="xl">
                                Register
                            </Button>
                        </form>
                    </Paper>
                </Container >
            </Grid.Col>
        </Grid>
    );
}