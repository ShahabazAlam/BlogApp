import { TextInput, Checkbox, Button, Group, Container, Title, Paper, PasswordInput, Grid, Select, Notification } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Check, X } from 'tabler-icons-react';
import { axios } from './Axios/axios'
import Router from 'next/router'

export default function CreatePermission(props) {
    const [role_id, setSelectedRole] = useState("")
    const [action, setAction] = useState("")
    const [resource, setResource] = useState("")
    const [error, setError] = useState("")
    const [rolelists, setRoleList] = useState([])
    const [success, setSuccess] = useState(false)


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
        }
        fetchData();
    }, [])

    const actionlists = [
        { value: 'delete', label: 'Delete' },
        { value: 'update', label: 'Update' },
    ]

    async function addPermission() {
        setError("")
        try {
            let res = await axios.post('user/permisssion/add', { 'role_id': role_id, 'action': action, 'resource': resource })
            if (res.data.error) {
                setError(res.data.data)
            } else {
                setSuccess(true)
                Router.reload()
            }
        } catch (e) {
            setError('Something went wrong.')
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
                Add New Permission
            </Title>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={addPermission}>
                    <TextInput
                        onKeyUp={(event) => setResource(event.currentTarget.value)}
                        required
                        label="Resource"
                        placeholder="Enter Resource Name"
                    />
                    <Select
                        label="Action"
                        placeholder="Select Action"
                        searchable
                        nothingFound="No options"
                        data={actionlists}
                        required
                        onChange={(value) => setAction(value)}
                    />
                    <Select
                        label="Role"
                        placeholder="Select Role"
                        searchable
                        nothingFound="No options"
                        data={rolelists}
                        required
                        onChange={(value) => setSelectedRole(value)}
                    />
                    <Button type='submit' fullWidth mt="xl">
                        Add
                    </Button>
                </form>
            </Paper>
        </Container >
    );
}