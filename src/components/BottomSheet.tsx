import { useEffect, type ReactNode } from 'react'

interface BottomSheetProps {
  title: string
  onClose: () => void
  children: ReactNode
  labelledBy?: string
}

export default function BottomSheet({ title, onClose, children, labelledBy = 'bottom-sheet-title' }: BottomSheetProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return <div className="overlay bottom-sheet-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="sheet bottom-sheet" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="sheet-grabber" aria-hidden="true" />
      <h2 id={labelledBy} className="sheet-title">{title}</h2>
      {children}
    </section>
  </div>
}
