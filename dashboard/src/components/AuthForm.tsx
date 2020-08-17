import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import tw from 'tailwind.macro'
import { setToken } from '../features/auth'
import { useDispatch } from 'react-redux'

const Container = styled.div`
  ${tw`text-center`}
`
const LoginButton = styled.button`
  ${tw`text-white text-xl font-bold bg-indigo-600 border-none rounded-full py-3 px-8 px-8 px-8 px-8`}
`
const Token = styled.input`
  ${tw`py-2 px-4 border-2 border-solid mb-2 border-indigo-700 rounded-full`}
`
const HiddenInput = styled.input`
  ${tw`hidden`}
`

export default () => {
  const dispatch = useDispatch()
  const [ tokenInput, setTokenInput ] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(setToken(tokenInput))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenInput(e.target.value)
    localStorage.setItem('token', e.target.value)
  }

  useEffect(() => {
    const cached = localStorage.getItem('token') || ''
    setTokenInput(cached)
  }, [])

  return (
    <Container>
      <form action="" onSubmit={ handleSubmit }>
        <div>
          <Token
            placeholder="Bearer token"
            value={ tokenInput }
            onChange={ handleInputChange }>
          </Token>
          <HiddenInput type="password"/>
        </div>
        <LoginButton type="submit">Entrar</LoginButton>
      </form>
    </Container>
  )
}
