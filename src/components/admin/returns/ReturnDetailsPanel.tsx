// src/components/admin/returns/ReturnDetailsPanel.tsx
import { ExternalLink, Loader2, MapPin, PackageX, Truck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminReturnDetail } from '../../../hooks/useAdminReturnDetail'
import { useReturnActions } from '../../../hooks/useReturnActions'
import { useToast } from '../../../context/ToastContext'
import { cn } from '../../../lib/cn'
import type { ReturnTimelineStep } from '../../../utils/adminReturnsFormat'
import {
  formatAdminReturnDate,
  formatAdminReturnMoney,
  getReturnActionAvailability,
  getReturnTimelineSteps,
  returnStatusBadgeTone,
} from '../../../utils/adminReturnsFormat'
import { Button } from '../../ui/Button'
import { focusRingClasses } from '../../ui/interactionStyles'
import { EmptyState } from '../ui/EmptyState'
import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'
import { ApproveReturnDialog } from './ApproveReturnDialog'
import { RefundReturnDialog } from './RefundReturnDialog'
import { RejectReturnDialog } from './RejectReturnDialog'

interface ReturnDetailsPanelProps {
  returnId: string | null
  className?: string
  /** Called after a successful status mutation — refreshes the list row. */
  onMutated?: () => void
}

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="text-[8px] uppercase leading-[12px] tracking-[-0.4px] text-white/30">
      {children}
    </p>
  )
}

function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  )
}

function ReturnTimelineDot({ status }: { status: ReturnTimelineStep['status'] | 'rejected' }) {
  if (status === 'rejected') {
    return (
      <span
        className="absolute start-0 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-support-error shadow-[0_0_8px_rgba(255,100,103,0.8)] rtl:translate-x-1/2"
        aria-hidden
      />
    )
  }
  if (status === 'completed') {
    return (
      <span
        className="absolute start-0 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-[#00d492] shadow-[0_0_8px_rgba(52,211,153,0.8)] rtl:translate-x-1/2"
        aria-hidden
      />
    )
  }
  if (status === 'active') {
    return (
      <span
        className="absolute start-0 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-[#a394ff] shadow-[0_0_8px_rgba(163,148,255,0.8)] rtl:translate-x-1/2"
        aria-hidden
      />
    )
  }
  return (
    <span
      className="absolute start-0 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-white/10 rtl:translate-x-1/2"
      aria-hidden
    />
  )
}

/** Milestone 3 — return lifecycle timeline (pending → approved → picked_up → received → refunded, with a rejected branch). */
function ReturnTimeline({ steps, locale }: { steps: ReturnTimelineStep[]; locale: string }) {
  const { t } = useTranslation()

  return (
    <ol className="relative flex flex-col">
      <span
        className="absolute bottom-2 start-0 top-2 w-0.5 -translate-x-1/2 bg-white/10 rtl:translate-x-1/2"
        aria-hidden
      />
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const isRejected = step.key === 'rejected'
        const labelClass = step.status === 'upcoming' ? 'text-white/30' : 'text-white'
        const metaClass = step.status === 'upcoming' ? 'text-white/20' : 'text-white/40'

        return (
          <li key={step.key} className={cn('relative flex flex-col ps-8', !isLast && 'pb-6')}>
            <ReturnTimelineDot status={isRejected ? 'rejected' : step.status} />
            <p
              className={cn(
                'text-sm font-semibold leading-5',
                isRejected ? 'text-support-error' : labelClass,
              )}
            >
              {t(`admin.returns.timeline.${step.key}`)}
            </p>
            {step.timestamp ? (
              <p className={cn('text-xs leading-4', metaClass)}>
                {formatAdminReturnDate(step.timestamp, locale)}
              </p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export function ReturnDetailsPanel({ returnId, className, onMutated }: ReturnDetailsPanelProps) {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const locale = i18n.language
  const { returnDetail, loading, error, reload } = useAdminReturnDetail({ returnId })
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)

  const handleMutated = () => {
    reload()
    onMutated?.()
  }

  const actions = useReturnActions({ returnId, onMutated: handleMutated })

  const handleMarkPickedUp = async () => {
    const result = await actions.advanceReturnStatus('picked_up')
    if (result.ok) toast.success(t('admin.returns.actions.advanceSuccess.picked_up'))
    else if (result.error) toast.error(result.error)
  }

  const handleMarkReceived = async () => {
    const result = await actions.advanceReturnStatus('received')
    if (result.ok) toast.success(t('admin.returns.actions.advanceSuccess.received'))
    else if (result.error) toast.error(result.error)
  }

  const handleScheduleBosta = async () => {
    const result = await actions.scheduleBostaReturn()
    if (result.ok) toast.success(t('admin.returns.actions.scheduleSuccess'))
    else if (result.error) toast.error(result.error)
  }

  if (!returnId) {
    return (
      <GlassCard
        strong
        padding="none"
        className={cn('flex min-h-[24rem] items-center justify-center rounded-[var(--admin-radius-xl)]', className)}
      >
        <EmptyState
          bare
          icon={<PackageX size={28} aria-hidden />}
          title={t('admin.returns.details.emptySelectionTitle')}
          description={t('admin.returns.details.emptySelectionDescription')}
        />
      </GlassCard>
    )
  }

  return (
    <GlassCard
      strong
      padding="none"
      className={cn('flex min-h-[24rem] flex-col rounded-[var(--admin-radius-xl)] p-6', className)}
    >
      {loading && !returnDetail ? <DetailsSkeleton /> : null}

      {!loading && error ? (
        <EmptyState
          bare
          title={t('admin.returns.details.loadErrorTitle')}
          description={error}
          action={
            <Button type="button" variant="outline" onClick={reload}>
              {t('admin.returns.retry')}
            </Button>
          }
        />
      ) : null}

      {!loading && !error && !returnDetail ? (
        <EmptyState
          bare
          title={t('admin.returns.details.emptyTitle')}
          description={t('admin.returns.details.emptyDescription')}
        />
      ) : null}

      {returnDetail && !error ? (
        <div className={cn('flex flex-col gap-6', loading && 'opacity-60')}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold leading-6 text-white">
                {t('admin.returns.details.title', { id: returnDetail.shortId })}
              </h3>
              <p className="text-xs leading-4 text-white/40">
                {formatAdminReturnDate(returnDetail.createdAt, locale)}
              </p>
            </div>
            <StatusBadge
              tone={returnStatusBadgeTone(returnDetail.refundStatus)}
              className="shrink-0 border border-current/20 px-2.5 py-1 text-[9px] font-bold tracking-[0.05em]"
            >
              {t(`admin.returns.status.${returnDetail.refundStatus}`)}
            </StatusBadge>
          </div>

          <GlassCard
            padding="none"
            className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="min-w-0">
              <FieldLabel>{t('admin.returns.details.refundAmount')}</FieldLabel>
              <p className="truncate text-base font-bold leading-6 text-accent">
                {formatAdminReturnMoney(returnDetail.refundAmount, locale)}
              </p>
            </div>
            <div className="min-w-0">
              <FieldLabel>{t('admin.returns.details.order')}</FieldLabel>
              <p className="truncate text-sm font-medium leading-5 text-white">
                {returnDetail.orderShortLabel ?? t('admin.returns.unknownOrder')}
              </p>
            </div>
            <div className="min-w-0">
              <FieldLabel>{t('admin.returns.details.reason')}</FieldLabel>
              <p className="truncate text-sm font-medium leading-5 text-white">
                {t(`admin.returns.reason.${returnDetail.reason}`)}
              </p>
            </div>
            <div className="min-w-0">
              <FieldLabel>{t('admin.returns.details.customer')}</FieldLabel>
              <p
                className="truncate text-sm font-medium leading-5 text-white"
                title={returnDetail.userEmail ?? undefined}
              >
                {returnDetail.userName}
              </p>
            </div>
          </GlassCard>

          <section className="flex flex-col gap-3" aria-labelledby="return-timeline-heading">
            <h4 id="return-timeline-heading" className="text-sm font-bold leading-5 text-white">
              {t('admin.returns.details.timeline')}
            </h4>
            <ReturnTimeline steps={getReturnTimelineSteps(returnDetail)} locale={locale} />
          </section>

          {returnDetail.note ? (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>{t('admin.returns.details.note')}</FieldLabel>
              <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-5 text-white/80">
                {returnDetail.note}
              </p>
            </div>
          ) : null}

          {returnDetail.adminNote ? (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>{t('admin.returns.details.adminNote')}</FieldLabel>
              <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-5 text-white/80">
                {returnDetail.adminNote}
              </p>
            </div>
          ) : null}

          {returnDetail.logisticsHandler ? (
            <section className="flex flex-col gap-3" aria-labelledby="return-logistics-heading">
              <div className="flex items-center gap-2">
                <Truck size={13} className="text-[#a394ff]" aria-hidden />
                <h4 id="return-logistics-heading" className="text-sm font-bold leading-5 text-white">
                  {t('admin.returns.details.logistics')}
                </h4>
              </div>
              <GlassCard
                padding="none"
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap gap-4">
                  <div className="min-w-0">
                    <FieldLabel>{t('admin.returns.details.handler')}</FieldLabel>
                    <p className="text-sm font-medium leading-5 text-white">
                      {t(`admin.returns.logisticsHandler.${returnDetail.logisticsHandler}`)}
                    </p>
                  </div>
                  {returnDetail.dropOffLocationName ? (
                    <div className="min-w-0">
                      <FieldLabel>{t('admin.returns.details.dropOff')}</FieldLabel>
                      <p className="truncate text-sm font-medium leading-5 text-white">
                        {returnDetail.dropOffLocationName}
                      </p>
                    </div>
                  ) : null}
                  {returnDetail.bostaTrackingNumber ? (
                    <div className="min-w-0">
                      <FieldLabel>{t('admin.returns.details.tracking')}</FieldLabel>
                      <p className="truncate text-sm font-medium leading-5 text-white">
                        {returnDetail.bostaTrackingNumber}
                      </p>
                    </div>
                  ) : null}
                  {returnDetail.bostaStateLabel ? (
                    <div className="min-w-0">
                      <FieldLabel>{t('admin.returns.details.bostaState')}</FieldLabel>
                      <p className="truncate text-sm font-medium leading-5 text-white">
                        {returnDetail.bostaStateLabel}
                      </p>
                    </div>
                  ) : null}
                  {returnDetail.logisticsScheduledAt ? (
                    <div className="min-w-0">
                      <FieldLabel>{t('admin.returns.details.scheduledAt')}</FieldLabel>
                      <p className="truncate text-sm font-medium leading-5 text-white">
                        {formatAdminReturnDate(returnDetail.logisticsScheduledAt, locale)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </GlassCard>
            </section>
          ) : null}

          {returnDetail.pickupAddress ? (
            <section className="flex flex-col gap-3" aria-labelledby="return-pickup-heading">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-[#a394ff]" aria-hidden />
                <h4 id="return-pickup-heading" className="text-sm font-bold leading-5 text-white">
                  {t('admin.returns.details.pickupAddress')}
                </h4>
              </div>
              <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-5 text-white/80">
                {[
                  returnDetail.pickupAddress.firstLine,
                  returnDetail.pickupAddress.secondLine,
                  returnDetail.pickupAddress.city,
                  returnDetail.pickupAddress.governorateName,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </section>
          ) : null}

          <section className="flex flex-col gap-3" aria-labelledby="return-items-heading">
            <h4 id="return-items-heading" className="text-sm font-bold leading-5 text-white">
              {t('admin.returns.details.items')}
            </h4>
            {returnDetail.items.length === 0 ? (
              <EmptyState bare className="py-6" title={t('admin.returns.details.itemsEmpty')} />
            ) : (
              <ul className="flex flex-col gap-2">
                {returnDetail.items.map((item, index) => (
                  <li
                    key={`${item.orderItemId}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-white">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-white/70">
                      {formatAdminReturnMoney(item.price * item.quantity, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-3" aria-labelledby="return-proof-heading">
            <h4 id="return-proof-heading" className="text-sm font-bold leading-5 text-white">
              {t('admin.returns.details.proofImages')}
            </h4>
            {returnDetail.proofImages.length === 0 ? (
              <EmptyState bare className="py-6" title={t('admin.returns.details.proofEmpty')} />
            ) : (
              <ul className="flex flex-wrap gap-2">
                {returnDetail.proofImages.map((image, index) => (
                  <li key={`${image.url}-${index}`}>
                    <a
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#a394ff] transition-colors hover:bg-white/10"
                    >
                      {t('admin.returns.details.proofLink', { index: index + 1 })}
                      <ExternalLink size={11} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ReturnActionsFooter
            availability={getReturnActionAvailability(returnDetail)}
            actions={actions}
            onApproveClick={() => setApproveOpen(true)}
            onRejectClick={() => setRejectOpen(true)}
            onMarkPickedUp={() => void handleMarkPickedUp()}
            onMarkReceived={() => void handleMarkReceived()}
            onScheduleBosta={() => void handleScheduleBosta()}
            onRefundClick={() => setRefundOpen(true)}
          />
        </div>
      ) : null}

      <ApproveReturnDialog
        open={approveOpen}
        returnShortId={returnDetail?.shortId}
        submitting={actions.approveSubmitting}
        error={actions.approveError}
        onClose={() => {
          setApproveOpen(false)
          actions.resetApproveError()
        }}
        onSubmit={async (payload) => {
          const result = await actions.approveReturn(payload)
          if (result.ok) toast.success(t('admin.returns.actions.approveSuccess'))
          else if (result.error) toast.error(result.error)
          return result.ok
        }}
      />

      <RejectReturnDialog
        open={rejectOpen}
        returnShortId={returnDetail?.shortId}
        submitting={actions.rejectSubmitting}
        error={actions.rejectError}
        onClose={() => {
          setRejectOpen(false)
          actions.resetRejectError()
        }}
        onSubmit={async (adminNote) => {
          const result = await actions.rejectReturn(adminNote)
          if (result.ok) toast.success(t('admin.returns.actions.rejectSuccess'))
          else if (result.error) toast.error(result.error)
          return result.ok
        }}
      />

      <RefundReturnDialog
        open={refundOpen}
        returnShortId={returnDetail?.shortId}
        refundAmount={returnDetail?.refundAmount ?? 0}
        paymentMethod={returnDetail?.orderPaymentMethod ?? null}
        submitting={actions.refundSubmitting}
        error={actions.refundError}
        onClose={() => setRefundOpen(false)}
        onSubmit={async () => {
          const result = await actions.refundReturn()
          if (result.ok) toast.success(t('admin.returns.actions.refundSuccess'))
          else if (result.error) toast.error(result.error)
          return result.ok
        }}
      />
    </GlassCard>
  )
}

interface ReturnActionsFooterProps {
  availability: ReturnType<typeof getReturnActionAvailability>
  actions: ReturnType<typeof useReturnActions>
  onApproveClick: () => void
  onRejectClick: () => void
  onMarkPickedUp: () => void
  onMarkReceived: () => void
  onScheduleBosta: () => void
  onRefundClick: () => void
}

/** Status-driven action buttons — business rules live in `getReturnActionAvailability`. */
function ReturnActionsFooter({
  availability,
  actions,
  onApproveClick,
  onRejectClick,
  onMarkPickedUp,
  onMarkReceived,
  onScheduleBosta,
  onRefundClick,
}: ReturnActionsFooterProps) {
  const { t } = useTranslation()
  const { canApprove, canReject, canMarkPickedUp, canMarkReceived, canScheduleBosta, canRefund } =
    availability

  if (
    !canApprove &&
    !canReject &&
    !canMarkPickedUp &&
    !canMarkReceived &&
    !canScheduleBosta &&
    !canRefund
  ) {
    return null
  }

  return (
    <section
      className="flex flex-wrap gap-2 border-t border-white/10 pt-4"
      aria-label={t('admin.returns.actions.sectionAria')}
    >
      {canApprove ? (
        <Button type="button" variant="gradient" onClick={onApproveClick}>
          {t('admin.returns.actions.approveButton')}
        </Button>
      ) : null}
      {canMarkPickedUp ? (
        <button
          type="button"
          disabled={actions.advanceSubmitting}
          onClick={onMarkPickedUp}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5',
            'text-sm font-semibold text-white transition-colors hover:bg-white/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            focusRingClasses,
          )}
        >
          {actions.advanceSubmitting ? (
            <Loader2 size={13} className="animate-spin" aria-hidden />
          ) : null}
          {t('admin.returns.actions.markPickedUpButton')}
        </button>
      ) : null}
      {canMarkReceived ? (
        <button
          type="button"
          disabled={actions.advanceSubmitting}
          onClick={onMarkReceived}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5',
            'text-sm font-semibold text-white transition-colors hover:bg-white/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            focusRingClasses,
          )}
        >
          {actions.advanceSubmitting ? (
            <Loader2 size={13} className="animate-spin" aria-hidden />
          ) : null}
          {t('admin.returns.actions.markReceivedButton')}
        </button>
      ) : null}
      {canScheduleBosta ? (
        <button
          type="button"
          disabled={actions.scheduleSubmitting}
          onClick={onScheduleBosta}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-[#a394ff]/40 bg-[rgba(163,148,255,0.12)] px-4 py-2.5',
            'text-sm font-semibold text-[#a394ff] transition-colors hover:bg-[rgba(163,148,255,0.2)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            focusRingClasses,
          )}
        >
          {actions.scheduleSubmitting ? (
            <Loader2 size={13} className="animate-spin" aria-hidden />
          ) : null}
          {t('admin.returns.actions.scheduleBostaButton')}
        </button>
      ) : null}
      {canRefund ? (
        <Button type="button" variant="gradient" onClick={onRefundClick}>
          {t('admin.returns.actions.refundButton')}
        </Button>
      ) : null}
      {canReject ? (
        <button
          type="button"
          onClick={onRejectClick}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-support-error/40 bg-transparent px-4 py-2.5',
            'text-sm font-semibold text-support-error transition-colors hover:bg-support-error/10',
            focusRingClasses,
          )}
        >
          {t('admin.returns.actions.rejectButton')}
        </button>
      ) : null}
    </section>
  )
}
