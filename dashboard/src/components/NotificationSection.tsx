import React, { useState } from 'react'
import gql from 'graphql-tag'
import tw from 'tailwind.macro'
import styled from '@emotion/styled'
import moment from 'moment'
import ReactJson from 'react-json-view'
import { Title as BaseTitle } from './styled'
import { useSubscription } from '@apollo/react-hooks'

interface Log {
  created_at: string,
  status: string,
  notification_id: number,
  data: object,
  notification: {
    via: string,
    recipient: string,
    kind: {
      value: string
    }
  }
}

interface NotificationGeneralProps {
  status: string
}

interface NotificationExtraDataProps {
  isExpanded: boolean
}

interface TimeProps {
  title: string
}

interface StatusProps extends NotificationGeneralProps {}

const Title = styled(BaseTitle)`
  ${tw`mb-4`}
`

const Container = styled.div`
  ${tw`flex-1`}
`

const Notification = styled.div`
  ${tw`mb-5`}
`

const NotificationGeneral = styled.button<NotificationGeneralProps>`
  ${tw`rounded-lg px-4 py-6 flex w-full border-none text-left relative z-10`}
  ${props => props.status === 'SUCCESS' && tw`bg-green-600`}
  ${props => props.status === 'FAILED' && tw`bg-red-600`}
  ${props => props.status === 'INTERNAL_ERROR' && tw`bg-red-700`}
`

const NotificationExtra = styled.div<NotificationExtraDataProps>`
  ${tw`rounded-lg px-4 pt-10 pb-6 shadow-md -mt-4 mb-9 relative z-0 mb-4 hidden`}
  ${props => props.isExpanded && tw`block`}
`

const NotificationIcon = styled.div`
  ${tw`flex-0 text-white text-3xl mr-3`}
`

const NotificationContent = styled.div`
  ${tw`flex-1`}
`

const NotificationInfo = styled.div`
  ${tw`flex-0 text-right`}
`

const NotificationDataLabel = styled.div`
  ${tw`text-gray-700 font-bold text-xs uppercase mb-6`}
`
const NotificationDataBlock = styled.div`
  ${tw`bg-gray-100 rounded-lg p-4`}
`

const Status = styled.div<StatusProps>`
  ${tw`bg-white p-1 px-2 rounded-md font-black border-3 border-solid text-xs inline-block`}
  ${props => props.status === 'SUCCESS' && tw`text-green-600`}
  ${props => props.status === 'FAILED' && tw`text-red-600`}
  ${props => props.status === 'INTERNAL_ERROR' && tw`text-red-700`}
  &:first-of-type {
    ${tw`mr-1`}
  }
`

const Time = styled.div<TimeProps>`
  ${tw`text-white text-sm mt-1 pr-2`}
`

const Recipient = styled.div`
  ${tw`text-white text-2xl mb-1 font-light`}
`

const Action = styled.div`
  ${tw`text-white text-xs uppercase font-black`}
`

const GET_LOG = gql`
subscription {
  notificationLog(order_by: { created_at: desc }) {
    created_at,
    notification_id,
    status,
    data,
    notification {
      via,
      kind {
        value
      },
      recipient
    }
  }
}
`

const NotificationItem = (props: { log: Log }) => {
  const [ showExtraData, setShowExtraData ] = useState(false)
  const { log } = props
  const date = moment(log.created_at)
  const dateDiff = date.fromNow()
  const jsonData = log.data

  const handleClick = (_e: React.MouseEvent) => {
    setShowExtraData(!showExtraData)
  }

  return (
    <Notification>
      <NotificationGeneral status={ log.status } onClick={ handleClick }>
        <NotificationIcon>
          { log.notification.via === 'email' 
            && (<span title="E-mail" className="icon icon-mail"></span>) }
          { log.notification.via === 'app' 
            && (<span title="App" className="icon icon-window-restore"></span>) }
        </NotificationIcon>
        <NotificationContent>
          <Recipient>
            { log.notification.recipient }
          </Recipient>
          <Action>
            { log.notification.kind.value }
          </Action>
        </NotificationContent>
        <NotificationInfo>
          <Status status={ log.status }>
            #{ log.notification_id }
          </Status>
          <Status status={ log.status }>
            { log.status }
          </Status>
          <Time title={ date.format('DD/MM/YYYY HH:II:ss') }>
            { dateDiff }
          </Time>
        </NotificationInfo>
      </NotificationGeneral>
      <NotificationExtra isExpanded={ showExtraData }>
        <NotificationDataBlock>
          <NotificationDataLabel>
            Result Data
          </NotificationDataLabel>
          <ReactJson src={ jsonData } name={ null }>
          </ReactJson>
        </NotificationDataBlock>
      </NotificationExtra>
    </Notification>
  )
}

export default () => {
  const { loading, error, data } = useSubscription(GET_LOG)

  return (
    <Container>
      <Title>Histórico de notificações</Title>
      { (data && !loading && !error)
        && data.notificationLog.map((log: Log, index: number) => (
          <NotificationItem log={log} key={ index } />
        )) }
    </Container>
  )
}

