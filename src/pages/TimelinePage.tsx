import { useEffect, useState } from 'react'
import { Search, Route, X, Trash2, Clock, MapPin, Tags } from 'lucide-react'
import { useSceneStore } from '@/store/useSceneStore'
import { useTagStore } from '@/store/useTagStore'
import { filterScenes } from '@/utils/sceneFilter'
import TagChip from '@/components/TagChip'
import TagManagerModal from '@/components/TagManagerModal'
import {
  formatTimestamp,
  getTimeOfDay,
  getWeatherIcon,
  getTreeIcon,
  getPedestrianIcon,
} from '@/utils/sceneHelpers'
import type { WindowScene, SceneTag } from '@/types'

export default function TimelinePage() {
  const {
    scenes,
    routeNames,
    selectedRoute,
    selectedTagIds,
    selectRoute,
    toggleTagFilter,
    clearTagFilters,
    loadAll,
    deleteScene,
  } = useSceneStore()
  const { tags, loadTags } = useTagStore()
  const [search, setSearch] = useState('')
  const [detailScene, setDetailScene] = useState<WindowScene | null>(null)
  const [showTagManager, setShowTagManager] = useState(false)

  useEffect(() => {
    loadAll()
    loadTags()
  }, [loadAll, loadTags])

  const filteredRoutes = routeNames.filter((r) =>
    r.toLowerCase().includes(search.toLowerCase())
  )

  const tagMap = new Map(tags.map((t) => [t.id, t]))
  // 标签被移除后，自动从筛选条件里剔除
  const activeTagIds = selectedTagIds.filter((id) => tagMap.has(id))
  const hasFilter = Boolean(selectedRoute) || activeTagIds.length > 0

  const getSceneTags = (scene: WindowScene): SceneTag[] =>
    (scene.tagIds ?? [])
      .map((id) => tagMap.get(id))
      .filter((t): t is SceneTag => Boolean(t))

  const sorted = filterScenes(scenes, {
    routeName: selectedRoute,
    tagIds: activeTagIds,
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const handleDelete = (id: string) => {
    deleteScene(id)
    setDetailScene(null)
  }

  const detailTags = detailScene ? getSceneTags(detailScene) : []

  return (
    <div className="min-h-screen bg-teal-950 font-serif text-mist-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-wide text-dusk-400">
            窗景时间线
          </h1>
          <button
            onClick={() => setShowTagManager(true)}
            className="flex items-center gap-1.5 rounded-lg border border-teal-800 bg-teal-900/60 px-3 py-1.5 text-xs text-mist-300 transition-colors hover:border-dusk-400/40 hover:text-dusk-300"
          >
            <Tags className="w-3.5 h-3.5" />
            标签管理
          </button>
        </div>

        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-mist-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索路线..."
              className="w-full rounded-lg border border-teal-800 bg-teal-900/60 py-2.5 pl-10 pr-4 text-sm text-mist-100 placeholder:text-mist-500 focus:border-dusk-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => selectRoute('')}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                !selectedRoute
                  ? 'bg-dusk-400 text-teal-950'
                  : 'bg-teal-900 text-mist-300 hover:bg-teal-800'
              }`}
            >
              全部
            </button>
            {filteredRoutes.map((name) => (
              <button
                key={name}
                onClick={() => selectRoute(name)}
                className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                  selectedRoute === name
                    ? 'bg-dusk-400 text-teal-950'
                    : 'bg-teal-900 text-mist-300 hover:bg-teal-800'
                }`}
              >
                <Route className="mr-1 inline w-3 h-3" />
                {name}
              </button>
            ))}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tags className="w-3.5 h-3.5 text-mist-500" />
              {tags.map((tag) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  selected={activeTagIds.includes(tag.id)}
                  onClick={() => toggleTagFilter(tag.id)}
                />
              ))}
              {activeTagIds.length > 0 && (
                <button
                  onClick={clearTagFilters}
                  className="text-[10px] text-mist-500 transition-colors hover:text-mist-300"
                >
                  清除标签
                </button>
              )}
            </div>
          )}
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-mist-400">
            <div className="mb-4 text-6xl opacity-30">🪟</div>
            <p className="text-lg">
              {hasFilter ? '没有符合全部条件的窗景' : '选择一条路线或标签，开始浏览窗景'}
            </p>
          </div>
        ) : (
          <div className="relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-teal-800" />
            <div className="space-y-6">
              {sorted.map((scene) => {
                const sceneTags = getSceneTags(scene)
                return (
                  <div key={scene.id} className="relative flex gap-4">
                    <div className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-full bg-dusk-400 ring-4 ring-teal-950" />
                    <div className="w-20 shrink-0 pt-0.5 text-right">
                      <p className="text-xs text-dusk-400">
                        {formatTimestamp(scene.timestamp)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-mist-500">
                        {getTimeOfDay(scene.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => setDetailScene(scene)}
                      className="group flex-1 rounded-xl border border-teal-800 bg-teal-900/50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-dusk-400/40 hover:shadow-lg hover:shadow-dusk-400/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getWeatherIcon(scene.weather)}
                        <span className="text-sm font-semibold text-mist-100">
                          {scene.segment}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-1.5 text-mist-400">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{scene.routeName}</span>
                        <span className="mx-1 text-teal-700">·</span>
                        <span className="text-xs">{scene.seatDirection}侧</span>
                      </div>
                      {scene.note && (
                        <p className="text-xs text-mist-400 line-clamp-2">
                          {scene.note}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        {getTreeIcon(scene.treeDensity)}
                        {getPedestrianIcon(scene.pedestrianStatus)}
                        {scene.signText && (
                          <span className="rounded bg-teal-800/60 px-1.5 py-0.5 text-[10px] text-mist-300">
                            {scene.signText}
                          </span>
                        )}
                      </div>
                      {sceneTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {sceneTags.map((tag) => (
                            <TagChip key={tag.id} tag={tag} />
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {detailScene && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setDetailScene(null)}
        >
          <div
            className="relative mx-4 w-full max-w-md animate-scale-in rounded-2xl border border-teal-700 bg-teal-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDetailScene(null)}
              className="absolute right-4 top-4 text-mist-400 hover:text-mist-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              {getWeatherIcon(detailScene.weather)}
              <h2 className="text-xl font-bold text-dusk-400">{detailScene.segment}</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-mist-300">
                <MapPin className="w-4 h-4 text-dusk-400" />
                <span>{detailScene.routeName}</span>
                <span className="text-teal-600">·</span>
                <span>{detailScene.seatDirection}侧</span>
              </div>
              <div className="flex items-center gap-2 text-mist-300">
                <Clock className="w-4 h-4 text-dusk-400" />
                <span>{formatTimestamp(detailScene.timestamp)}</span>
                <span className="text-teal-600">·</span>
                <span>{getTimeOfDay(detailScene.timestamp)}</span>
              </div>
              <div className="flex items-center gap-3 text-mist-300">
                {getTreeIcon(detailScene.treeDensity)}
                <span>{detailScene.treeDensity}</span>
                {getPedestrianIcon(detailScene.pedestrianStatus)}
                <span>{detailScene.pedestrianStatus}</span>
              </div>
              {detailScene.signText && (
                <div className="rounded-lg bg-teal-800/50 px-3 py-2 text-mist-200">
                  招牌: {detailScene.signText}
                </div>
              )}
              {detailScene.note && (
                <div className="rounded-lg border border-teal-800 px-3 py-2 text-mist-300">
                  {detailScene.note}
                </div>
              )}
              {detailTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detailTags.map((tag) => (
                    <TagChip key={tag.id} tag={tag} />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleDelete(detailScene.id)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-red-900/40 py-2.5 text-sm text-red-300 transition-colors hover:bg-red-900/60"
            >
              <Trash2 className="w-4 h-4" />
              删除此窗景
            </button>
          </div>
        </div>
      )}

      <TagManagerModal open={showTagManager} onClose={() => setShowTagManager(false)} />
    </div>
  )
}
