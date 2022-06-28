import { TextInput, Checkbox, Button, Group, Container, Title, Paper, PasswordInput, Grid, Select, Notification, NativeSelect } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { axios } from '../../components/Axios/axios'
import { Check, X } from 'tabler-icons-react';

export default function AddUser(props) {
    const [email, setEmail] = useState("")
    const [first_name, setFirstName] = useState("")
    const [last_name, setLastName] = useState("")
    const [password, setPassword] = useState("")
    const [super_user, setSuperUser] = useState(false)
    const [selected_role, setSelectedRole] = useState("")
    const [error, setError] = useState("")
    const [rolelists, setRoleList] = useState([])
    const [success, setSuccess] = useState(false)
    const [user_id, setUserId] = useState("")
    const routers = useRouter()

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get('/user/roles')
                if (res.data.error) {
                    setError(res.data.data)
                } else {
                    let temp = []
                    res.data && res.data.data.length && res.data.data.map(res => {
                        temp.push({
                            value: res.id,
                            label: res.name,
                            name: res.name,
                        })
                    })
                    setRoleList(temp)
                }
            } catch (e) {
                setLoadError('Something went wrong.')
            }
            if (props.id) {
                try {
                    const res = await axios.get(`/user/get/${props.id}`)
                    if (res.data.error) {
                        setError(res.data.data)
                    } else {
                        if (res.data && res.data.data) {
                            setFirstName(res.data.data.first_name)
                            setLastName(res.data.data.last_name)
                            setSelectedRole(res.data.data.role_id)
                            setSuperUser(res.data.data.super_user)
                            setUserId(res.data.data.id)
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
        fetchData();
    }, [])

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },

        validate: {
            confirmPassword: props.id ? null : (value, values) => value !== values.password ? 'Passwords did not match' : null,
            email: props.id ? null : (value) => (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value) ? null : 'Invalid email'),
            password: props.id ? null : (value) => (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(value) ? null : 'Password should contain atleast one number and one special character'),
        },
    });

    async function handleSubmit() {
        setError("")
        try {

            var current_url = ""
            var current_method = ""
            let obj = {
                'first_name': first_name,
                'last_name': last_name,
                'super_user': super_user,
                'role_id': parseInt(selected_role)
            }
            if (props.id) {
                current_url = `user/update/${user_id}`
                current_method = 'put'
            }
            if (!props.id) {
                obj['email'] = email
                obj['password'] = password
                current_url = 'user/add'
                current_method = 'post'
            }

            const res = await axios[current_method](current_url, obj)
            if (res.data.error) {
                setError(res.data.data)
            } else {
                if (props.id) {
                    setSuccess(true)
                    routers.push('/users')
                } else {
                    setSuccess(true)
                    routers.push('/login')
                }
            }
        } catch (e) {
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
                        {props.id ? 'Update User Details' : 'Add User'}
                    </Title>
                    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                        <form onSubmit={form.onSubmit(() => handleSubmit())}>
                            <TextInput defaultValue={first_name}
                                onKeyUp={(event) => setFirstName(event.currentTarget.value)}
                                required
                                label="First Name"
                                placeholder="Enter First Name"
                                {...form.getInputProps('first_name')}
                            />
                            <TextInput defaultValue={last_name}
                                onKeyUp={(event) => setLastName(event.currentTarget.value)}
                                required
                                label="Last Name"
                                placeholder="Enter First Name"
                                {...form.getInputProps('last_name')}
                            />
                            {!props.id &&
                                <>
                                    <TextInput defaultValue={email}
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
                                        required 
                                        mt="md"
                                        onKeyUp={(event) => setReenterPassword(event.currentTarget.value)}
                                        {...form.getInputProps('confirmPassword')}
                                    />
                                </>
                            }

                            <NativeSelect defaultValue={selected_role}
                                label="Role"
                                placeholder="Select Role"
                                searchable
                                nothingFound="No options"
                                data={rolelists}
                                {...form.getInputProps('role')}
                                onChange={(value) => setSelectedRole(value)}
                            />
                            <Group position="apart" mt="md">
                                <Checkbox
                                    checked={super_user}
                                    label="Super User"
                                    onClick={(event) => setSuperUser(event.currentTarget.checked)}
                                    {...form.getInputProps('super_user')}
                                />
                            </Group>
                            <Button type='submit' fullWidth mt="xl">
                                Add
                            </Button>
                        </form>
                    </Paper>
                </Container >
            </Grid.Col>
        </Grid>
    );
}