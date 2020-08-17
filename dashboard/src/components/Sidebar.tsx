import React from 'react'
import styled from '@emotion/styled'
import tw from 'tailwind.macro'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { Link } from 'react-router-dom'

const Title = styled.div`
  ${tw`text-4xl mb-5 text-indigo-700`}
`

const Button = styled.button`
  ${tw`text-indigo-900 text-left bg-gray-100 hover:bg-gray-300 border-none py-3 px-4 rounded-lg mb-2 text-lg w-full`}
  transition: 0.1s ease-out all;
`

const GET_KINDS = gql`
query {
  notificationKind {
    value
  }
}
`

export default () => {
  const { loading, error, data } = useQuery(GET_KINDS)

  return (
    <div>
      <Title>Ações</Title>
      <ul>
        { (data && !loading && !error)
          && data.notificationKind.map((kind: { value: string }, index: number) => (
            <li key={ index }>
              <Link to={`/dashboard/acao/${ kind.value }`}>
                <Button>
                  { kind.value }
                </Button>
              </Link>
            </li>
          )) }
      </ul>
    </div>
  )
}
