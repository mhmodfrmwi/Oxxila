// src/hooks/useFormulaSpecsFaqs.ts
import { isAbortError } from '../lib/isAbortError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createAdminFaq, getAdminProductFaqs } from '../api/admin/faqs'
import { ApiError } from '../lib/api'
import type { AdminFaqFormErrors, AdminFaqRow } from '../types/adminFaqs'
import {
  ADMIN_FAQ_ANSWER_MAX,
  ADMIN_FAQ_QUESTION_MAX,
  mapApiFaqToAdminRow,
} from '../utils/adminFaqsFormat'

interface UseFormulaSpecsFaqsOptions {
  open: boolean
  productId: string | null
  productName?: string | null
}

export function useFormulaSpecsFaqs({
  open,
  productId,
  productName = null,
}: UseFormulaSpecsFaqsOptions) {
  const { t } = useTranslation()
  const [faqs, setFaqs] = useState<AdminFaqRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [question, setQuestionState] = useState('')
  const [answer, setAnswerState] = useState('')
  const [errors, setErrors] = useState<AdminFaqFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const resetDraft = useCallback(() => {
    setQuestionState('')
    setAnswerState('')
    setErrors({})
    setSubmitError(null)
  }, [])

  useEffect(() => {
    if (!open) {
      setFaqs([])
      setLoading(false)
      setLoadError(null)
      setExpandedId(null)
      resetDraft()
      return
    }

    if (!productId) {
      setFaqs([])
      setLoading(false)
      setLoadError(null)
      setExpandedId(null)
      resetDraft()
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)
    resetDraft()

    void (async () => {
      try {
        const response = await getAdminProductFaqs(productId, {
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return
        const rows = (response.data ?? []).map((faq) =>
          mapApiFaqToAdminRow(faq, { id: productId, name: productName }),
        )
        setFaqs(rows)
        setExpandedId(rows[0]?.id ?? null)
        setLoading(false)
      } catch (error) {
        if (isAbortError(error) || requestId !== requestIdRef.current) return
        setLoading(false)
        setLoadError(
          error instanceof ApiError
            ? error.message
            : t('admin.products.formula.faq.loadError'),
        )
      }
    })()

    return () => {
      controller.abort()
    }
  }, [open, productId, productName, resetDraft, t])

  const setQuestion = useCallback((value: string) => {
    setQuestionState(value)
    setErrors((previous) => {
      if (!previous.question) return previous
      const next = { ...previous }
      delete next.question
      return next
    })
    setSubmitError(null)
  }, [])

  const setAnswer = useCallback((value: string) => {
    setAnswerState(value)
    setErrors((previous) => {
      if (!previous.answer) return previous
      const next = { ...previous }
      delete next.answer
      return next
    })
    setSubmitError(null)
  }, [])

  const toggleExpanded = useCallback((faqId: string) => {
    setExpandedId((current) => (current === faqId ? null : faqId))
  }, [])

  const submit = useCallback(async () => {
    if (!productId) {
      setSubmitError(t('admin.products.formula.faq.saveProductFirst'))
      return false
    }

    const nextErrors: AdminFaqFormErrors = {}
    const trimmedQuestion = question.trim()
    const trimmedAnswer = answer.trim()

    if (!trimmedQuestion) {
      nextErrors.question = t('admin.products.formula.faq.questionRequired')
    } else if (trimmedQuestion.length > ADMIN_FAQ_QUESTION_MAX) {
      nextErrors.question = t('admin.products.formula.faq.questionTooLong', {
        max: ADMIN_FAQ_QUESTION_MAX,
      })
    }

    if (!trimmedAnswer) {
      nextErrors.answer = t('admin.products.formula.faq.answerRequired')
    } else if (trimmedAnswer.length > ADMIN_FAQ_ANSWER_MAX) {
      nextErrors.answer = t('admin.products.formula.faq.answerTooLong', {
        max: ADMIN_FAQ_ANSWER_MAX,
      })
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await createAdminFaq(productId, {
        question: trimmedQuestion,
        answer: trimmedAnswer,
        isActive: true,
      })
      const data = response.data
      if (!data) {
        throw new ApiError(
          response.message || t('admin.products.formula.faq.createFailed'),
        )
      }
      const row = mapApiFaqToAdminRow(data, {
        id: productId,
        name: productName,
      })
      setFaqs((previous) => [row, ...previous])
      setExpandedId(row.id)
      resetDraft()
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : t('admin.products.formula.faq.createFailed'),
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [answer, productId, productName, question, resetDraft, t])

  return {
    faqs,
    loading,
    loadError,
    question,
    answer,
    errors,
    submitting,
    submitError,
    expandedId,
    canCreate: Boolean(productId),
    setQuestion,
    setAnswer,
    toggleExpanded,
    submit,
  }
}
