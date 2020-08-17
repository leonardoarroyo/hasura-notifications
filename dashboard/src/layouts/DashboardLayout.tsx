import React from 'react'
import styled from '@emotion/styled'
import tw from 'tailwind.macro'
import Header from '../components/Header'
import { useSelector } from 'react-redux'
import { RootState } from '../rootReducer'
import { Redirect } from 'react-router-dom'

const Container = styled.div`
  ${tw`max-w-6xl m-auto mt-10`}
`

const Panel = styled.div`
  ${tw`flex`}
`

interface DashboardProps {
  children: React.ReactNode
}

const DashboardLayout: React.SFC<DashboardProps> = (props) => {
  const { children } = props
  const isAuthenticated = useSelector<RootState, boolean>(state => state.auth.authenticated)

  if (!isAuthenticated) {
    return (<Redirect to="/" />)
  }

  return (
    <Container>
      <Header />
      <Panel>
        { children }
      </Panel>
    </Container>
  )

}

export default DashboardLayout
