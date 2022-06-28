import { TextInput, Checkbox, Button, Group, Container, Title, Paper, PasswordInput, Grid, Select, Notification } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Check, X } from 'tabler-icons-react';
import { axios } from './Axios/axios'
import Router from 'next/router'

export default function CreateRole(props) {
    const [role_name, setRoleName] = useState("")
    const [role_id, setRoleId] = useState("")
    const [error, setError] = useState("")
    const [update, setUpdate] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (props.data && Object.keys(props.data).length) {
            setRoleId(props.data.id)
            setRoleName(props.data.name)
            setUpdate(true)
        }
    }, [])

    async function addRoles() {
        setError("")
        try {
            var current_url = 'user/role/add'
            var current_method = 'post'

            if (update) {
                current_url = `user/role/update/${role_id}`
                current_method = 'put'
            }
            const res = await axios[current_method](current_url, { 'name': role_name })
            if (res.data.error) {
                setError(res.data.data)
            } else {
                setSuccess(true)
                Router.reload()
            }
        } catch (e) {
            if (e.response && e.response.data) setError(e.response.data.detail)
            else setError('Something went wrong.')
        }
    }

    function closeNotification() {
        setSuccess(false)
    }

    return (
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
                {update ? 'Update Role' : 'Add New Role'}
            </Title>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={addRoles}>
                    <TextInput defaultValue={role_name}
                        onKeyUp={(event) => setRoleName(event.currentTarget.value)}
                        required
                        label="Role Name"
                        placeholder="Enter Role Name"
                    />
                    <Button type='submit' fullWidth mt="xl">
                        Add
                    </Button>
                </form>
            </Paper>
        </Container >
    );
}