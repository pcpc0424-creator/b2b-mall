import { Link } from 'react-router-dom'
import { ArrowRight, Package, Leaf, Pill, Sparkles, Shirt, ChefHat, Refrigerator, Monitor, Dumbbell, PawPrint } from 'lucide-react'
import { useCategories, useProducts } from '../hooks/queries'
import { Button, Badge, Card, CardContent } from '../components/ui'
import { Animated } from '../hooks'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  Leaf,
  Pill,
  Sparkles,
  Shirt,
  ChefHat,
  Refrigerator,
  Monitor,
  Dumbbell,
  PawPrint,
}

export function CategoriesPage() {
  const { data: categories = [] } = useCategories()
  const { data: products = [] } = useProducts()

  const getProductCount = (categoryId: number) => {
    return products.filter(p => p.categoryId === categoryId).length
  }

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return Package
    return iconMap[iconName] || Package
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Animated animation="fade-up">
            <h1 className="text-3xl font-bold text-neutral-900">전체 카테고리</h1>
            <p className="text-neutral-500 mt-2">원하시는 카테고리를 선택해 상품을 둘러보세요</p>
          </Animated>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const IconComponent = getCategoryIcon(category.icon)
              const productCount = getProductCount(category.id)

              return (
                <Animated key={category.id} animation="fade-up" delay={index * 80}>
                  <Card hover className="overflow-hidden h-full">
                    {/* Category Image */}
                    <Link to={`/category/${category.id}`} className="block">
                      <div className="relative h-48 overflow-hidden img-hover">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/30 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">{category.name}</h2>
                          </div>
                          <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-0">
                            {productCount}개 상품
                          </Badge>
                        </div>
                      </div>
                    </Link>

                    {/* Subcategories */}
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {category.subcategories.slice(0, 5).map((sub, idx) => (
                          <Link
                            key={idx}
                            to={`/category/${category.id}?sub=${encodeURIComponent(sub)}`}
                            className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                          >
                            <Badge variant="default" size="sm" className="cursor-pointer hover:bg-primary-100 hover:text-primary-700">
                              {sub}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                      <Link to={`/category/${category.id}`}>
                        <Button variant="outline" className="w-full btn-hover">
                          카테고리 보기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </Animated>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
