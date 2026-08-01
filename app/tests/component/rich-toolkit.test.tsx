import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownEditor, MediaPlayer, MetricChart, RegistryIcon } from '@/components/rich'

describe('rich capability boundaries', () => {
  it('renders chart data with an accessible table alternative', () => {
    render(<MetricChart title="Checks" points={[{ label: 'Auth', value: 9 }]} />)
    expect(screen.getByRole('img', { name: 'Checks' })).toBeVisible()
    expect(screen.getByRole('table', { name: 'Checks data' })).toBeInTheDocument()
  })

  it('previews markdown as text without injecting HTML', () => {
    const value = '<img src=x onerror=alert(1)>'
    render(<MarkdownEditor label="Content" value={value} onChange={() => undefined} />)
    expect(screen.getByRole('region', { name: 'Content preview' })).toHaveTextContent(value)
    expect(document.querySelector('img')).toBeNull()
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: '# safe' } })
  })

  it('rejects remote media and safely falls back for unknown icons', () => {
    render(
      <>
        <MediaPlayer type="video" src="https://evil.example/video.mp4" label="Video" />
        <RegistryIcon name="not-registered" label="Unknown icon fallback" />
      </>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Unsafe media source rejected')
    expect(screen.getByRole('img', { name: 'Unknown icon fallback' })).toBeVisible()
  })
})
