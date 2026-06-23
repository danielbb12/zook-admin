import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import CategoryTree from './CategoryTree'

export default async function CategoriesPage() {
  const supabase = createAdminClient()

  const [{ data: categories, error: catError }, { data: videoRows }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, is_active, sort_order')
      .order('sort_order'),
    supabase.from('videos').select('category'),
  ])

  if (catError) console.error('[categories] fetch error:', catError.message)

  // Count videos per category name
  const countMap: Record<string, number> = {}
  for (const v of videoRows ?? []) {
    if (v.category) countMap[v.category] = (countMap[v.category] ?? 0) + 1
  }

  const cats = (categories ?? []).map((c) => ({
    ...c,
    video_count: c.name ? (countMap[c.name] ?? 0) : 0,
  }))

  return (
    <div>
      <PageHeader title="קטגוריות" subtitle={`${cats.length} קטגוריות`} />
      <CategoryTree initialCategories={cats} />
    </div>
  )
}
