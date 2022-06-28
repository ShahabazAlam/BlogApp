import React, { useEffect, useState } from 'react';
import { Anchor, ArchiveOff, Edit, Link, } from 'tabler-icons-react';
import { axios, internal_server_url } from '../components/Axios/axios'
import { Button, Table } from '@mantine/core';
import { Container, Grid } from '@mantine/core';
import AddUser from './create/user';

export default function Users() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState("")
  const [usertoupdate, setUserToUpdate] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/user/all-users')
        if (res.data.error) {
          setError(res.data.data)
        } else {
          setRows(res.data.data)
        }
      } catch (e) {
        console.log(e)
      }
    }
    fetchData();
  }, [])

  function setUpdateUser(id) {
    setUserToUpdate(false)
    setTimeout(function () {
      setUserToUpdate(id)
    }, 200)
  }

  return (
    <Grid>
      {error &&
        <div style={{ width: '100%' }}>
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        </div>
      }
      <Grid.Col span={usertoupdate ? 6 : 8}>
        <Container size={1000} my={40}>
          <h3>User Lists:</h3>
          <Table captionSide="bottom" striped={true}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{rows.map(res => {
              return (
                <tr>
                  <td>{res.name}</td>
                  <td>{res.email}</td>
                  <td><Button color="green" onClick={() => setUpdateUser(res.id)}>Edit</Button></td>
                </tr>
              )
            })}</tbody>
          </Table>
        </Container>
      </Grid.Col>
      {usertoupdate &&
        <Grid.Col span={6}>
          <AddUser id={usertoupdate} />
        </Grid.Col>}
    </Grid>
  );
}