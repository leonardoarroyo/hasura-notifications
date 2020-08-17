import React from 'react'
import AuthForm from '../components/AuthForm'
import styled from '@emotion/styled'
import tw from 'tailwind.macro'
import { useSelector } from 'react-redux'
import { RootState } from '../rootReducer'
import { Redirect } from 'react-router-dom'

const Container = styled.div`
  ${tw`pt-20`}
`

const Title = styled.h1`
  ${tw`text-center text-6xl text-indigo-700 font-light`}
`

const Black = styled.span`
  ${tw`font-bold`}
`

const FormSection = styled.div`
  ${tw`mt-8`}
`

export default () => {
  const isAuthenticated = useSelector<RootState, boolean>(state => state.auth.authenticated)

  if (isAuthenticated) {
    return (<Redirect to="/dashboard" />)
  }

  return (
    <Container>
      <Title>notify<Black>box</Black></Title>
      <FormSection>
        <AuthForm></AuthForm>
      </FormSection>
    </Container>
  )
}
