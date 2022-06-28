import React, { useState, useEffect } from 'react';
import { createStyles, Header, Menu, Group, Center, Burger, Container, useMantineTheme } from '@mantine/core';
import { useBooleanToggle } from '@mantine/hooks';
import { ChevronDown } from 'tabler-icons-react';
import Link from 'next/link';
import { clearUserToken, isLoggedIn } from './Token/tokenAction';
import { useRouter } from 'next/router';
import PostModal from '../pages/create/blog';
import { axios } from '../components/Axios/axios'


const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors[theme.primaryColor][6],
    borderBottom: 0,
  },

  inner: {
    height: 56,
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 1000,

    '&:hover': {
      backgroundColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 7 : 5],
    },
  },

  linkLabel: {
    marginRight: 5,
  },

  logo: {
    float: 'left',
    marginLeft: 20,
  },
  logout: {
    float: 'right',
    marginRight: 10,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 1000,
    marginTop: 10,

    '&:hover': {
      backgroundColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 7 : 5],
    },
  },

  user: {
    float: 'right',
    marginRight: 15,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: 'black',
    fontSize: theme.fontSizes.sm,
    fontWeight: 1000,
    marginTop: 10
  },

}));


export default function MyHeader() {
  const [opened, toggleOpened] = useBooleanToggle(false);
  const { classes } = useStyles();
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(false)
  const [add_new_post, openPostModal] = useState(false)

  const router = useRouter()

  useEffect(() => {
    let user = isLoggedIn()
    setLoggedIn(user)
    async function fetchData() {
      try {
        const res = await axios.get('/user/me/')
        setUser(res.data)
      } catch (e) {
        console.log('Something went wrong.', e)
      }
    }
    fetchData()
  }, [])

  const userLogOut = async () => {
    await clearUserToken()
    router.push('/login')
  }



  const createPost = (val) => {
    openPostModal(val)
  }


  let links = [{ 'label': 'Home', 'link': '/' }]

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>{item.label}</Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu
          key={link.label}
          trigger="hover"
          delay={0}
          transitionDuration={0}
          placement="end"
          gutter={1}
          control={
            <a
              href={link.link}
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <ChevronDown size={12} />
              </Center>
            </a>
          }
        >
          {menuItems}
        </Menu>
      );
    }

    return (
      <Link href={link.link}><a
        key={link.label}
        className={classes.link}
      >
        {link.label}
      </a></Link>
    );
  });

  return (
    <div>
      <Header height={56} className={classes.header}>
        <h3 className={classes.logo}>My-Blog</h3>
        {loggedIn && user && <span className={classes.user}>User : {user.user}</span>}
        {loggedIn && <a href="#" onClick={userLogOut} className={classes.logout}>LogOut </a>}
        {loggedIn && <a href="#" onClick={() => createPost(true)} className={classes.logout}>New Post</a>}
        {loggedIn && user.super_user && <Link href={'/create/user'}><a className={classes.logout}>Add User</a></Link>}
        {loggedIn && user.super_user && <Link href={'/roles/'}><a className={classes.logout}>Roles</a></Link>}
        {loggedIn && user.super_user && <Link href={'/permissions/'}><a className={classes.logout}>Permissions</a></Link>}
        {loggedIn && user.super_user && <Link href={'/users/'}><a className={classes.logout}>Users</a></Link>}
        <Container>
          <div className={classes.inner}>
            <Group spacing={5} className={classes.links}>
              {items}
            </Group>
            <Burger
              opened={opened}
              onClick={() => toggleOpened()}
              className={classes.burger}
              size="sm"
              color="#fff"
            />
          </div>
        </Container>
      </Header>
      {add_new_post && <PostModal closePostModal={createPost} />}
    </div>
  );
}