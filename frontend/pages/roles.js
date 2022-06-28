import React, { useEffect, useState } from 'react';
import { Anchor, ArchiveOff, Edit, Link, } from 'tabler-icons-react';
import { axios, internal_server_url } from '../components/Axios/axios'
import { Button, Table } from '@mantine/core';
import { Container, Grid } from '@mantine/core';
import AddUser from './create/user';
import CreatePermission from "../components/createPermission";
import CreateRole from '../components/creatRole';

export default function Roles() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState("")
  const [roletoupdate, setRoleToUpdate] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/user/roles')
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

  function setUpdateRole(id) {
    setRoleToUpdate(false)
    setTimeout(function () {
      setRoleToUpdate(id)
    }, 200)

  }

  function setUpdateRoleFalse() {
    setRoleToUpdate(false)
  }

  return (
    <Grid>
      {error &&
        <div style={{ width: '100%' }}>
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        </div>
      }
      <Grid.Col span={6}>
        <Container size={1000} my={40}>
          <h3>User Lists:</h3>
          <Table captionSide="bottom" striped={true}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{rows.map(res => {
              return (
                <tr>
                  <td>{res.name}</td>
                  <td><Button color="green" onClick={() => setUpdateRole(res)}>Edit</Button></td>
                </tr>
              )
            })}</tbody>
          </Table>
        </Container>
      </Grid.Col>
      {roletoupdate &&
        <Grid.Col span={4} ml={100}>
          <CreateRole data={roletoupdate} />
        </Grid.Col>}
      {!roletoupdate && <Grid.Col span={4} ml={100}>
        <CreateRole />
      </Grid.Col>}
      {roletoupdate &&
        <Grid.Col span={1} mt={20}>
          <Button color="blue" onClick={setUpdateRoleFalse}>Add New Role</Button>
        </Grid.Col>
      }
    </Grid>
  );
}