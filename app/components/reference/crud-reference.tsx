'use client'

import { useMemo, useState } from 'react'
import {
  ActionDrawer,
  AuditedActionDialog,
  ContractUpload,
  DataTable,
  ResourceDescription,
  SchemaForm,
  useFeedback,
  type DataColumn,
} from '@/components/crud'

type ReferenceResource = {
  id: string
  name: string
  status: 'active' | 'paused'
  owner: string
}

const initialRows: ReferenceResource[] = [
  { id: 'res-001', name: 'Governance policy', status: 'active', owner: 'Platform' },
  { id: 'res-002', name: 'Audit export', status: 'paused', owner: 'Security' },
]

export function CrudReference() {
  const [rows, setRows] = useState(initialRows)
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const feedback = useFeedback()
  const columns = useMemo<DataColumn<ReferenceResource>[]>(
    () => [
      { key: 'name', header: 'Name', render: (row) => row.name },
      { key: 'status', header: 'Status', render: (row) => <span className={`status-badge status-${row.status}`}>{row.status}</span> },
      { key: 'owner', header: 'Owner', render: (row) => row.owner },
    ],
    [],
  )
  return (
    <div className="reference-grid">
      <section className="reference-card reference-wide">
        <h2>Table, pagination and state boundaries</h2>
        <DataTable
          caption="Reference resources"
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          emptyLabel="No resources"
          page={page}
          pageCount={3}
          onPageChange={setPage}
        />
      </section>
      <section className="reference-card">
        <h2>Schema form</h2>
        <SchemaForm
          fields={[
            { name: 'name', label: 'Resource name', required: true },
            {
              name: 'owner',
              label: 'Owner',
              type: 'select',
              required: true,
              options: [
                { label: 'Platform', value: 'Platform' },
                { label: 'Security', value: 'Security' },
              ],
            },
          ]}
          submitLabel="Add reference resource"
          onSubmit={(values) => {
            setRows((current) => [
              ...current,
              {
                id: `local-${current.length + 1}`,
                name: values.name,
                owner: values.owner,
                status: 'active',
              },
            ])
            setNotice('Reference resource added locally')
          }}
        />
      </section>
      <section className="reference-card">
        <ResourceDescription
          title="Resource details"
          items={[
            { label: 'Contract', value: 'AdminResource v1' },
            { label: 'State owner', value: 'Paired FastAPI backend' },
            { label: 'Mutation policy', value: 'CSRF + audit reason + conditional update' },
          ]}
        />
        <div className="reference-actions">
          <AuditedActionDialog
            triggerLabel="Run audited action"
            title="Confirm governed mutation"
            description="The application adapter must send this reason and a correlation ID to the backend."
            confirmLabel="Confirm"
            onConfirm={(reason) => setNotice(`Audit reason accepted: ${reason}`)}
          />
          <ContractUpload
            label="Contract upload adapter"
            accept=".json,application/json"
            maxBytes={1024 * 1024}
            onSelect={(file) => setNotice(`Selected ${file.name}`)}
          />
          <button type="button" className="secondary-button" onClick={() => setDrawerOpen(true)}>
            Open details drawer
          </button>
        </div>
        {notice ? <p className="reference-notice" role="status">{notice}</p> : null}
        <ActionDrawer open={drawerOpen} title="Resource detail drawer" onClose={() => setDrawerOpen(false)}>
          <ResourceDescription
            title="Drawer details"
            items={[{ label: 'Adapter', value: 'App-provided domain contract' }]}
          />
          <button
            type="button"
            className="primary-button"
            onClick={() => feedback.notify('success', 'Reference notification delivered')}
          >
            Send notification
          </button>
        </ActionDrawer>
      </section>
    </div>
  )
}
