import React from 'react'
import styled from '@emotion/styled'
import tw from 'tailwind.macro'
import gql from 'graphql-tag'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import { Title } from './styled'

interface Template {
  id: number,
  via: string,
  value: string,
  data: string,
  recipient_type: string,
}

const MiniTitle = styled.div`
  ${tw`text-xs uppercase mb-5 font-black text-indigo-800`}
`

const SemiTitle = styled(Title)`
  ${tw`text-2xl text-indigo-800`}
`

const Template = styled.div`
  ${tw`mb-5 bg-gray-300 px-4 py-6 rounded-lg flex`}
`

const TemplateIcon = styled.div`
  ${tw`flex-0 text-indigo-800 text-3xl mr-3`}
`

const TemplateVia = styled.div`
  ${tw`text-indigo-800 text-center font-black rounded-lg border-2 border-indigo-800 border-solid mt-2 py-1 px-3 bg-white text-xs uppercase`}

`

const TemplateItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <Template>
      { children }
    </Template>
  )
}

const GET_TEMPLATES = gql`
subscription GetMessageTemplate($kind_value: String!) {
  messageTemplate(
    where: {
      kind: {
        value: {
          _eq: $kind_value
        }
      }
    }
  ) {
    id,
    via,
    data,
    value,
    recipient_type
  }
}
`

const TemplateListItem = ({ item: template }: { item: Template }) => {
  const data = JSON.parse(template.data)
  const subject = data.subect || null
  return (
    <TemplateItem>
      <TemplateIcon>
        { template.via === 'email' 
          && (<span title="E-mail" className="icon icon-mail"></span>) }
        { template.via === 'app' 
          && (<span title="App" className="icon icon-window-restore"></span>) }
        <TemplateVia>
          { template.via }
        </TemplateVia>
      </TemplateIcon>
      <div>
        { JSON.stringify(data) }
      </div>
      <div>
        { template.via }
        { template.via === 'email' 
          && (<span>{ subject }</span>) }
      </div>
      { template.id }
    </TemplateItem>
  )
}

export default () => {
  const { kind } = useParams()
  const { loading, data, error } = useSubscription(GET_TEMPLATES, {
    variables: {
      kind_value: kind
    }
  })

  return (<div>
    <Title>{ kind }</Title>
    <MiniTitle>Gerenciamento de ação</MiniTitle>
    <SemiTitle>Templates</SemiTitle>
      { (!loading && !error) &&
        (data.messageTemplate.length > 0 ? (
          <span>
            { data.messageTemplate.map((x: Template) => (
              <TemplateListItem item={ x } />
            )) }
          </span>
        ) : (
          <span>
            Nenhum template foi cadastrado para esta ação.
            &nbsp;<Link to="/">Cadastre um novo template.</Link>
          </span>
        ))
      }
    <SemiTitle>Triggers</SemiTitle>
  </div>)
}

