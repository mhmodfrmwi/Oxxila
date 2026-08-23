// src/components/product/ProductPageErrorState.tsx
import { AlertCircle, PackageSearch } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { HOME_PATH, SHOP_PATH } from '../../config/routes'
import { Button } from '../ui/Button'
import '../../styles/product-page-error.css'

export type ProductPageErrorKind = 'not_found' | 'load_error'

interface ProductPageErrorStateProps {
  kind: ProductPageErrorKind
}

export function ProductPageErrorState({ kind }: ProductPageErrorStateProps) {
  const { t } = useTranslation()
  const isNotFound = kind === 'not_found'
  const Icon = isNotFound ? PackageSearch : AlertCircle

  return (
    <div className="product-page-error" role={isNotFound ? 'status' : 'alert'}>
      <div className="product-page-error-icon" aria-hidden>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h1 className="product-page-error-title">
        {t(isNotFound ? 'productDetail.notFoundTitle' : 'productDetail.loadErrorTitle')}
      </h1>
      <p className="product-page-error-description">
        {t(isNotFound ? 'productDetail.notFoundDescription' : 'productDetail.loadErrorDescription')}
      </p>
      <div className="product-page-error-actions">
        <Link to={SHOP_PATH}>
          <Button variant="primary" pill>
            {t('actions.continueShopping')}
          </Button>
        </Link>
        <Link to={HOME_PATH} className="product-page-error-link">
          {t('nav.home')}
        </Link>
      </div>
    </div>
  )
}
