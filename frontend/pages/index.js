import React, { useEffect, useState } from 'react';
import { ArchiveOff, Edit, } from 'tabler-icons-react';
import { axios, internal_server_url } from './../components/Axios/axios'
import { Pagination, SimpleGrid } from '@mantine/core';

import {
  Card,
  Image,
  Text,
  ActionIcon,
  Group,
  useMantineTheme,
  createStyles,
  Dialog,
  Button,
  Alert
} from '@mantine/core';
import { AlertCircle } from 'tabler-icons-react';
import PostModal from './create/blog';

const useStyles = createStyles((theme) => ({
  card: {
    position: 'relative',
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    width: '55%',
    marginLeft: '25%'
  },

  rating: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs + 2,
    pointerEvents: 'none',
  },

  title: {
    display: 'block',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs / 2,
  },

  action: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
  },

  footer: {
    marginTop: theme.spacing.md,
  },
}));


export default function Home() {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const [addpost, setAddPost] = useState(false)
  const [lists, setList] = useState([])
  const [deletepost, setDelete] = useState(false)
  const [editpost, setEdit] = useState(false)
  const [userdata, setUSerData] = useState({})
  const [selected_post, setSelectedPost] = useState({})
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/blog')
        const per = await axios.get('/user/me/permissions/')
        if (res.data.error) {
          setError(res.data.data)
          return
        } if (per.data.error) {
          setError(res.data.data)
          return
        }
        setUSerData(per.data)
        setList(res.data.data)
      } catch (e) {
        setError('Something went wrong.')
      }
    }
    fetchData();
  }, [])

  function openEditModal(val, res) {
    setSelectedPost(res)
    setEdit(val)
  }

  function deleteBlogConfirm(id) {
    setDelete(id)
  }

  async function deleteBlog(id) {
    try {
      const res = await axios.delete(`/blog/${deletepost}/delete`)
      if (res.data.error) {
        setError(res.data.data)
        return
      } else {
        const temp = [...lists.filter(res => res.id != deletepost)];
        setList(temp)
        setDelete(false)
      }
    } catch (e) {
      setDelete(false)
      setError('Something went wrong.')
      setTimeout(() => setError(""), 2000);
    }
  }

  return (
    <div>
      {error &&
        <Alert mt={5} icon={<AlertCircle size={16} />} title="Error!" color="red">
          {error}
        </Alert>
      }

      {(lists && lists.length) ? lists.map((res, key) => {
        return (
          <Card key={key} withBorder radius="md" className={classes.card} mt={15}>
            {res.image && <Card.Section>
              <a>
                <Image src={internal_server_url + '/media/' + res.image} height={250} />
              </a>
            </Card.Section>}
            <Text className={classes.title} weight={500} component="a">
              {res.title}
            </Text>
            <Text size="sm" color="dimmed" lineClamp={4}>
              {res.description}
            </Text>

            <Group position="apart" className={classes.footer}>
              <Group spacing={8} mr={0}>
                {((userdata.super_user || userdata.permissions.includes('update')) || userdata.user_id == res.user_id) &&
                  <ActionIcon className={classes.action} style={{ color: theme.colors.red[6] }}>
                    <Edit size={16} onClick={() => openEditModal(true, res)} />
                  </ActionIcon>}
                {((userdata.super_user || userdata.permissions.includes('delete')) || userdata.user_id == res.user_id) &&
                  <ActionIcon className={classes.action} style={{ color: theme.colors.yellow[7] }}>
                    <ArchiveOff size={16} onClick={() => deleteBlogConfirm(res.id)} />
                  </ActionIcon>}
              </Group>
            </Group>
          </Card>
        )
      }) :
        <h4 style={{ textAlign: 'center' }}>No post available.</h4>
      }
      {editpost && <PostModal data={selected_post} closePostModal={openEditModal} update={true} />}
      <Dialog
        transition="slide-up"
        transitionDuration={300}
        transitionTimingFunction="ease"
        opened={deletepost}
        withCloseButton
        position={{ top: 20, left: '40%' }}
        onClose={() => setDelete(false)}
        size="lg"
        radius="md"
      >
        <Text size="sm" style={{ marginBottom: 10 }} weight={500}>
          Do you really want to delete post?
        </Text>

        <div style={{ width: '100%', textAlign: 'right' }}>
          <Button color="red" onClick={() => deleteBlog()}>Delete</Button>
        </div>
      </Dialog>
    </div>
  );
}
