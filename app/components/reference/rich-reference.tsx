'use client'

import { useState } from 'react'
import {
  AvatarList,
  AvatarMenu,
  CopyButton,
  DraggableList,
  FlashMessage,
  LongPressButton,
  MarkdownEditor,
  MediaPlayer,
  MetricChart,
  ProgressBar,
  RegistryIcon,
  ScrollText,
  Watermark,
} from '@/components/rich'

export function RichReference() {
  const [markdown, setMarkdown] = useState('# Governed content\n\n<script>alert(1)</script>')
  const [notice, setNotice] = useState('')
  const [orderedItems, setOrderedItems] = useState(['Identity', 'Authorization', 'Audit'])
  return (
    <div className="reference-grid">
      <section className="reference-card">
        <h2>Avatar and controlled actions</h2>
        <AvatarList
          users={[
            { id: '1', label: 'Platform Admin' },
            { id: '2', label: 'Security Reviewer' },
            { id: '3', label: 'Operator' },
            { id: '4', label: 'Auditor' },
            { id: '5', label: 'Observer' },
          ]}
        />
        <AvatarMenu
          label="Platform Admin"
          actions={[{ key: 'profile', label: 'Open profile', onSelect: () => setNotice('Profile selected') }]}
        />
      </section>
      <section className="reference-card">
        <h2>Local icon registry</h2>
        <div className="icon-showcase">
          <RegistryIcon name="database" label="Database" />
          <RegistryIcon name="security" label="Security" />
          <RegistryIcon name="unknown" label="Unknown icon fallback" />
        </div>
      </section>
      <section className="reference-card reference-wide">
        <MetricChart
          title="Governance checks"
          points={[
            { label: 'Auth', value: 96 },
            { label: 'Audit', value: 84 },
            { label: 'Release', value: 91 },
          ]}
        />
      </section>
      <section className="reference-card">
        <MarkdownEditor label="Safe Markdown boundary" value={markdown} onChange={setMarkdown} />
      </section>
      <section className="reference-card">
        <h2>Progress and behaviors</h2>
        <ProgressBar label="Migration evidence" value={72} />
        <div className="reference-actions">
          <CopyButton value="correlation-id-example" label="Copy correlation ID" />
          <LongPressButton label="Long press" onLongPress={() => setNotice('Long press accepted')} />
        </div>
        <Watermark text="SunmoonAI">
          <div className="watermark-content">Controlled data watermark</div>
        </Watermark>
        <ScrollText>Long governed status text remains keyboard accessible and does not depend on a Vue directive.</ScrollText>
        <FlashMessage>Flash status</FlashMessage>
        <DraggableList
          items={orderedItems}
          itemKey={(item) => item}
          renderItem={(item) => item}
          onReorder={setOrderedItems}
        />
      </section>
      <section className="reference-card">
        <h2>Same-origin media boundary</h2>
        <MediaPlayer type="audio" src="/media/reference.mp3" label="Reference audio" />
      </section>
      {notice ? <p className="reference-notice reference-wide" role="status">{notice}</p> : null}
    </div>
  )
}
