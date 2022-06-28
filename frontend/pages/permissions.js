import React, { useEffect, useState } from 'react';
import { axios } from '../components/Axios/axios'
import { Button, Table } from '@mantine/core';
import { Container, Grid } from '@mantine/core';
import CreatePermission from "../components/createPermission";

export default function Permissions() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/user/permissions/')
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
                <th>Permission</th>
              </tr>
            </thead>
            <tbody>{rows.map(res => {
              return (
                <tr>
                  <td>{res.resource}</td>
                  <td>{res.action}</td>
                </tr>
              )
            })}</tbody>
          </Table>
        </Container>
      </Grid.Col>
      <Grid.Col span={6}>
        <CreatePermission />
      </Grid.Col>
    </Grid>
  );
}