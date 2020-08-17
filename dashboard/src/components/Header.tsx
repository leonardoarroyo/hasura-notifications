import React from 'react'
import styled from '@emotion/styled'
import tw from 'tailwind.macro'
import { Link } from 'react-router-dom'

const Header = styled.header`
  ${tw`bg-indigo-700 text-white p-4 rounded-lg mb-6 text-right`}
`

const HeaderLink = styled(Link)`
  ${tw`text-white no-underline mr-4`}
`

export default () => {
  return (
    <Header>
      <HeaderLink to="/dashboard">Ações</HeaderLink>
      <HeaderLink to="/dashboard/notificacoes">Histórico</HeaderLink>
      <HeaderLink to="/sair">Sair</HeaderLink>
    </Header>
  )
}
