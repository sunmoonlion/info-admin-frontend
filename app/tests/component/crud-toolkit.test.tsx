import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  AuditedActionDialog,
  DataTable,
  ResourceDescription,
  SchemaForm,
} from '@/components/crud'

describe('CRUD toolkit', () => {
  it('renders semantic table, empty state and pagination', () => {
    const onPageChange = vi.fn()
    const { rerender } = render(
      <DataTable
        caption="Resources"
        rows={[{ id: '1', name: 'Policy' }]}
        columns={[{ key: 'name', header: 'Name', render: (row) => row.name }]}
        rowKey={(row) => row.id}
        emptyLabel="No resources"
        page={1}
        pageCount={2}
        onPageChange={onPageChange}
      />,
    )
    expect(screen.getByRole('table', { name: 'Resources' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    rerender(
      <DataTable
        caption="Resources"
        rows={[]}
        columns={[{ key: 'name', header: 'Name', render: () => null }]}
        rowKey={() => 'none'}
        emptyLabel="No resources"
        page={1}
        pageCount={0}
        onPageChange={onPageChange}
      />,
    )
    expect(screen.getByText('No resources')).toBeVisible()
  })

  it('validates schema fields before submission and renders empty descriptions safely', () => {
    const onSubmit = vi.fn()
    render(
      <>
        <SchemaForm
          fields={[{ name: 'name', label: 'Name', required: true }]}
          submitLabel="Save resource"
          onSubmit={onSubmit}
        />
        <ResourceDescription title="Details" items={[{ label: 'Owner', value: null }]} />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save resource' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('—')).toBeVisible()
  })

  it('requires an audit reason before executing a governed action', () => {
    const onConfirm = vi.fn()
    render(
      <AuditedActionDialog
        triggerLabel="Open action"
        title="Governed action"
        description="Mutation"
        confirmLabel="Confirm action"
        onConfirm={onConfirm}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open action' }))
    const confirm = screen.getByRole('button', { name: 'Confirm action' })
    expect(confirm).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Audit reason'), { target: { value: 'approved' } })
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledWith('approved')
  })
})
