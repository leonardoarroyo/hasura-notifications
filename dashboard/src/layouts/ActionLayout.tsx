import React from 'react'
import styled from '@emotion/styled'
import tw from 'tailwind.macro'
import DashboardLayout from './DashboardLayout'
import Sidebar from '../components/Sidebar'

const SidebarWrapper = styled.div`
  ${tw`flex-1 pr-4`}
  max-width: 12rem;
`

const ContentWrapper = styled.div`
  ${tw`flex-1 pl-4`}
`

interface ActionProps {
  children: React.ReactNode
}

const ActionLayout: React.SFC<ActionProps> = (props) => {
  const { children } = props

  return (
    <DashboardLayout>
      <SidebarWrapper>
        <Sidebar></Sidebar>
      </SidebarWrapper>
      <ContentWrapper>
        { children }
      </ContentWrapper>
    </DashboardLayout>
  )

}

export default ActionLayout
