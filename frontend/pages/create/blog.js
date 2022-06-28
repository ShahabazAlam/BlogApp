import { useEffect, useState } from 'react';
import { Modal, Button, useMantineTheme, Textarea, Text, Paper, TextInput, Group } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { axios } from '../../components/Axios/axios'
import Router from 'next/router'

export const dropzoneChildren = (status, theme) => (
    <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
        {/* <ImageUploadIcon status={status} style={{ color: getIconColor(status, theme) }} size={80} /> */}

        <div>
            <Text size="xl" inline>
                Drag images here or click to select files
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed 5mb
            </Text>
        </div>
    </Group>
);

export default function PostModal(props) {
    const theme = useMantineTheme();
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [file, setFile] = useState("")
    const [filename, setFileName] = useState("")
    const [error, setError] = useState("")
    const [add_new_post, openPostModal] = useState(false)
    const [row, setRow] = useState({})

    const closePostModal = () => {
        props.closePostModal(false, {})
        openPostModal(false)
    }

    useEffect(() => {
        if (props.data) {
            setRow(props.data)
            setFileName(props.data.image)
            setTitle(props.data.title)
            setDescription(props.data.description)
        }
        openPostModal(true)
    }, [])

    const handlePost = async () => {
        const formData = new FormData();
        var url = "blog/add"
        var action = 'post'
        formData.append('title', title);
        formData.append('description', description);
        if (file.length) {
            formData.append('image', file[0]);
        }
        if (props.update) {
            formData.append('blog_id', row.id);
            url = "blog/update"
            action = 'put'
        }
        try {
            const res = await axios[action](url, formData)
            if (res.data.error) {
                setError(res.data.data)
            } else {
                Router.push('/')
            }
        } catch (e) {
            console.log(e)
        }
    }

    const onChaneFile = (file) => {
        setFile(file)
        setFileName(file[0].name)
    }


    return (
        <>
            <Modal
                opened={add_new_post}
                onClose={() => closePostModal(false)}
                title="Add Post"
                overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}
                overlayOpacity={0.55}
                overlayBlur={3}
                centered={true}
                size={700}
                closeOnClickOutside={false}
            >
                <Paper withBorder shadow="md" p={30}>
                    {error &&
                        <div style={{ width: '100%' }}>
                            <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                        </div>
                    }
                    <form onSubmit={handlePost}>
                        <TextInput
                            {...title && { defaultValue: title }}
                            onKeyUp={(event) => setTitle(event.currentTarget.value)}
                            required
                            label="Title"
                            placeholder="enter title"
                        />
                        <Textarea
                            {...description && { defaultValue: description }}
                            onKeyUp={(event) => setDescription(event.currentTarget.value)}
                            placeholder="Description"
                            required
                            label="Description."
                        />
                        <Dropzone style={{ height: '200px', marginTop: '10px', marginBottom: '10px' }}
                            onDrop={(files) => onChaneFile(files)}
                            onReject={(files) => onChaneFile(files)}
                            maxSize={3 * 1024 ** 2}
                            accept={IMAGE_MIME_TYPE}
                        >
                            {(status) => dropzoneChildren(status, theme)}
                        </Dropzone>
                        File :  {filename && <span cl>{filename}</span>}
                        <Button type='submit' fullWidth mt="xl">
                            Post
                        </Button>
                    </form>
                </Paper>
            </Modal>
        </>
    );
}