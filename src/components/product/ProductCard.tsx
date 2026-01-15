import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Package } from 'lucide-react'
import { Product } from '../../types'
import { useStore, getPriceByTier, getTierLabel } from '../../store'
import { Button, Badge, NumberStepper } from '../ui'
import { formatPrice } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { user, addToCart } = useStore()
  const [quantity, setQuantity] = useState(0)

  const tier = user?.tier || 'guest'
  const currentPrice = getPriceByTier(product, tier)
  const retailPrice = product.prices.retail

  const stockStatusConfig = {
    available: { label: '재고충분', variant: 'success' as const },
    low: { label: '재고부족', variant: 'warning' as const },
    out_of_stock: { label: '품절', variant: 'error' as const },
  }

  const stockConfig = stockStatusConfig[product.stockStatus]

  return (
    <div className="group bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-xl hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square bg-neutral-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant={stockConfig.variant} size="sm" className="animate-fade-in">
            {stockConfig.label}
          </Badge>
        </div>
        {currentPrice < retailPrice && (
          <div className="absolute top-2 right-2">
            <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded animate-pulse-soft">
              {Math.round((1 - currentPrice / retailPrice) * 100)}% OFF
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <div className="mb-1 md:mb-2 h-4">
          <span className="text-xs text-neutral-500 truncate">{product.brand}</span>
        </div>

        <Link to={`/product/${product.id}`} className="h-8 md:h-10">
          <h3 className="text-xs md:text-sm font-medium text-neutral-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 md:mt-3 h-12 md:h-14">
          {currentPrice < retailPrice && (
            <p className="text-xs text-neutral-400 line-through">
              {formatPrice(retailPrice)}
            </p>
          )}
          <p className="text-sm md:text-lg font-bold text-primary-600">
            {formatPrice(currentPrice)}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-2 md:pt-4 space-y-2">
          <NumberStepper
            value={quantity}
            onChange={setQuantity}
            min={0}
            max={product.stock}
            size="sm"
            disabled={product.stockStatus === 'out_of_stock'}
          />
          <Button
            size="sm"
            onClick={() => addToCart(product, quantity)}
            disabled={product.stockStatus === 'out_of_stock'}
            className="w-full btn-hover text-xs md:text-sm"
          >
            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            장바구니
          </Button>
        </div>
      </div>
    </div>
  )
}
