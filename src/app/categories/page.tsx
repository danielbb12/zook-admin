import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import CategoryTree from './CategoryTree'

export default async function CategoriesPage() {
  const supabase = createAdminClient()

  const [{ data: categories }, { data: videoCounts }] = await Promise.all([
    supabase.from('categories').select('id, name, parent_id, slug, is_active').order('name'),
    supabase.from('videos').select('category'),
  ])

  // Count videos per category slug
  const countMap: Record<string, number> = {}
  for (const v of videoCounts ?? []) {
    if (v.category) countMap[v.category] = (countMap[v.category] ?? 0) + 1
  }

  const cats = (categories ?? []).map((c) => ({
    ...c,
    video_count: countMap[c.slug ?? ''] ?? countMap[c.id] ?? 0,
  }))

  return (
    <div>
      <PageHeader title="קטגוריות" subtitle={`${cats.length} קטגוריות`} />
      <CategoryTree initialCategories={cats} />
    </div>
  )
}
