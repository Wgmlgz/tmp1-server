import { Popconfirm } from 'antd'
import React, { FC, ReactNode } from 'react'
import CSS from 'csstype'

const full_screen_card_style: CSS.Properties = {
  position: 'fixed',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  zIndex: '100',
  display: 'grid',
  placeItems: 'center',
  backdropFilter: 'blur(4px)',
  backgroundColor: '#22222222',
}

const FullscreenCard: FC<{ children: ReactNode; onCancel: () => any }> = ({
  children,
  onCancel,
}) => (
  <Popconfirm
    placement='left'
    title='Вы точно хотите отменить изменения?'
    onConfirm={onCancel}
    okText='Да'
    cancelText='Нет'>
    <div style={full_screen_card_style}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  </Popconfirm>
)

export default FullscreenCard
