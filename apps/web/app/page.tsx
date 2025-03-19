import prismaClient from '@repo/db/client'
import React from 'react'

const fetchUsers = async () => {
  const data = await prismaClient.user.findMany()
  console.log("data", data)
  return data
}

const page =async  () => {
  const users = await fetchUsers()
  return (
    <div>{JSON.stringify(users)}</div>
  )
}

export default page