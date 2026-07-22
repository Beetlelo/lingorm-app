import { useEffect, useState } from 'react'
import { fileToDataURL } from '../lib/image'

type Merch = {
  id: number
  name: string
  price: number
  grad: string
  img?: string
  owned: boolean
  store: string
  city: string
}

const GRADS = [
  'linear-gradient(135deg,#7C6CF0,#FF6FB5)',
  'linear-gradient(135deg,#FF6FB5,#C4A1FE)',
  'linear-gradient(135deg,#C4A1FE,#FF6FB5)',
  'linear-gradient(135deg,#4d80f2,#7C6CF0)',
  'linear-gradient(135deg,#33ccb3,#4d80f2)',
]

const LS_KEY = 'lingorm_merch'

// 首次进入时把示例周边写入本地，之后完全以 localStorage 为准（真实录入，可增删改）
const SEED: Merch[] = [
  { id: 1, name: '应援手灯', price: 129, grad: GRADS[0], owned: true, store: 'LingOrm 官方周边店', city: '曼谷' },
  { id: 2, name: '签名海报', price: 89, grad: GRADS[1], owned: false, store: 'GMM 粉丝商城', city: '曼谷' },
  { id: 3, name: '同款卫衣', price: 299, grad: GRADS[0], owned: true, store: 'Orm 个人潮牌', city: '上海' },
  { id: 4, name: '限定小卡', price: 39, grad: GRADS[2], owned: false, store: '演唱会现场贩售', city: '深圳' },
  { id: 5, name: '应援毛巾', price: 59, grad: GRADS[3], owned: true, store: 'LingOrm 官方周边店', city: '曼谷' },
  { id: 6, name: '合影立牌', price: 199, grad: GRADS[4], owned: false, store: '粉丝同人市集', city: '北京' },
]

function loadMerch(): Merch[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw === null) {
      localStorage.setItem(LS_KEY, JSON.stringify(SEED))
      return [...SEED]
    }
    return JSON.parse(raw) as Merch[]
  } catch {
    return [...SEED]
  }
}

const fmtPrice = (n: number) => `¥${n.toLocaleString('en-US')}`
const parsePrice = (s: string) => {
  const n = Number(s.replace(/[^0-9.]/g, ''))
  return Number.isNaN(n) ? 0 : Math.round(n)
}

export default function Nearby() {
  const [list, setList] = useState<Merch[]>(loadMerch)
  const [active, setActive] = useState<'全部' | '想买' | '已拥有'>('全部')
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Merch>>({ name: '', price: 0, store: '', city: '', owned: false })
  const [imgPreview, setImgPreview] = useState<string | undefined>()
  const [saved, setSaved] = useState(false)

  // 任何增删改都写回 localStorage，保证"共 N 件"来自真实录入
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(list))
    } catch {
      /* noop */
    }
  }, [list])

  const filtered = list.filter((m) => {
    if (active === '想买' && m.owned) return false
    if (active === '已拥有' && !m.owned) return false
    if (!q.trim()) return true
    const t = q.trim().toLowerCase()
    return m.name.toLowerCase().includes(t) || m.store.toLowerCase().includes(t) || m.city.toLowerCase().includes(t)
  })

  function openAdd() {
    setEditingId(null)
    setForm({ name: '', price: 0, store: '', city: '', owned: false })
    setImgPreview(undefined)
    setShowForm(true)
  }

  function openEdit(m: Merch) {
    setEditingId(m.id)
    setForm({ name: m.name, price: m.price, store: m.store, city: m.city, owned: m.owned })
    setImgPreview(m.img)
    setShowForm(true)
  }

  async function onPickImage(file?: File) {
    if (!file) return
    try {
      const url = await fileToDataURL(file)
      setImgPreview(url)
    } catch {
      /* ignore */
    }
  }

  function submit() {
    if (!form.name || (form.price ?? 0) <= 0) return
    const price = form.price ?? 0
    if (editingId != null) {
      setList((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, name: form.name!, price, store: form.store || '', city: form.city || '', owned: !!form.owned, img: imgPreview }
            : m,
        ),
      )
    } else {
      const id = list.reduce((mx, m) => Math.max(mx, m.id), 0) + 1
      const grad = GRADS[id % GRADS.length]
      setList((prev) => [
        ...prev,
        { id, name: form.name!, price, grad, img: imgPreview, owned: !!form.owned, store: form.store || '', city: form.city || '' },
      ])
    }
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setShowForm(false)
    }, 800)
  }

  function remove(id: number) {
    setList((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="-mt-1">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[14px] text-glass opacity-80">你的应援周边库</p>
          <h1 className="text-[24px] font-bold text-glass-strong leading-tight">周边收藏</h1>
        </div>
        <button
          type="button"
          onClick={openAdd}
          aria-label="添加周边"
          className="glass-strong w-10 h-10 rounded-[19px] flex items-center justify-center text-accent text-[22px] leading-none active:scale-95 transition"
        >
          +
        </button>
      </div>

      {/* Search by store / city */}
      <div className="glass-strong flex items-center gap-2 px-4 py-3 rounded-[12px] mb-3">
        <svg className="w-[18px] h-[18px] text-glass-soft shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="按店铺或城市搜，如 曼谷 / 官方周边店"
          className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-glass-strong placeholder:text-glass-soft"
          aria-label="搜索周边"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="text-glass opacity-60 text-[14px] active:scale-90 transition shrink-0"
            aria-label="清除搜索"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex gap-2 mb-4">
        {(['全部', '想买', '已拥有'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActive(f)}
            className={`px-4 py-2 rounded-[14px] text-[13px] transition active:scale-95 ${
              active === f ? 'text-accent font-medium' : 'text-glass-soft'
            }`}
            style={active === f ? { background: 'rgba(124,108,240,0.12)' } : { background: 'rgba(255,255,255,0.08)' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-[12px] text-glass opacity-70 mb-2">共 {filtered.length} 件周边</p>

      {/* Merch Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-card p-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-[26px] mb-3">🛍️</div>
          <p className="text-[15px] text-glass-strong font-medium">没有找到相关周边</p>
          <p className="text-[13px] text-glass opacity-70 mt-1 mb-4">
            {q.trim() ? `没有匹配「${q.trim()}」的周边` : '试试切换筛选或清空搜索'}
          </p>
          {(q.trim() || active !== '全部') && (
            <button
              type="button"
              onClick={() => { setQ(''); setActive('全部') }}
              className="px-4 py-2 rounded-[14px] text-[13px] text-white active:scale-95 transition"
              style={{ background: 'var(--color-accent-primary)' }}
            >
              清除筛选
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((m) => (
            <div key={m.id} className="glass-strong rounded-card overflow-hidden card-lift">
              <div className="relative h-24" style={{ background: m.img ? undefined : m.grad }}>
                {m.img && <img src={m.img} alt={m.name} className="w-full h-full object-cover" />}
                <span
                  className={`absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-[10px] font-medium ${
                    m.owned ? 'text-white' : 'text-[#1e1b3a]'
                  }`}
                  style={{ background: m.owned ? 'var(--color-accent-pink)' : '#F7F5FC' }}
                >
                  {m.owned ? '已拥有' : '想买'}
                </span>
                <div className="absolute top-2 left-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(m)}
                    aria-label="编辑"
                    className="w-6 h-6 rounded-full bg-black/30 text-white text-[12px] flex items-center justify-center active:scale-90 transition"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    aria-label="删除"
                    className="w-6 h-6 rounded-full bg-black/30 text-white text-[12px] flex items-center justify-center active:scale-90 transition"
                  >
                    🗑
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[13px] font-medium text-glass-strong truncate">{m.name}</p>
                <p className="text-[14px] text-accent font-mono mt-1">{fmtPrice(m.price)}</p>
                <p className="text-[11px] text-glass opacity-60 mt-1 truncate">📍 {m.store} · {m.city}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="glass-strong rounded-card p-4 mb-4 space-y-3">
          <p className="text-[14px] font-semibold text-glass-strong">{editingId != null ? '编辑周边' : '添加周边'}</p>
          <input
            type="text"
            value={form.name || ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="周边名称，如：应援手灯"
            className="w-full bg-transparent border-b border-white/10 outline-none py-2 text-[14px] text-glass-strong placeholder:text-glass-soft"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-glass opacity-70 mb-1">价格</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="¥0"
                onChange={(e) => setForm((f) => ({ ...f, price: parsePrice(e.target.value) }))}
                className="w-full bg-transparent border-b border-white/10 outline-none py-2 text-[14px] text-glass-strong placeholder:text-glass-soft"
              />
            </div>
            <div>
              <label className="block text-[11px] text-glass opacity-70 mb-1">城市</label>
              <input
                type="text"
                placeholder="如 曼谷 / 上海"
                value={form.city || ''}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full bg-transparent border-b border-white/10 outline-none py-2 text-[14px] text-glass-strong placeholder:text-glass-soft"
              />
            </div>
          </div>
          <input
            type="text"
            value={form.store || ''}
            onChange={(e) => setForm((f) => ({ ...f, store: e.target.value }))}
            placeholder="店铺 / 购买渠道"
            className="w-full bg-transparent border-b border-white/10 outline-none py-2 text-[14px] text-glass-strong placeholder:text-glass-soft"
          />
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-glass opacity-80">已拥有</span>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, owned: !f.owned }))}
              className={`px-3 py-1.5 rounded-[10px] text-[12px] transition active:scale-95 ${
                form.owned ? 'text-white' : 'glass text-glass-strong'
              }`}
              style={form.owned ? { background: 'var(--color-accent-primary)' } : undefined}
            >
              {form.owned ? '已拥有' : '想买'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[12px] text-glass opacity-70">图片（可选）</label>
            <label className="glass px-3 py-1.5 rounded-[12px] text-[12px] text-accent active:scale-95 transition cursor-pointer">
              选择图片
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickImage(e.target.files?.[0])}
              />
            </label>
            {imgPreview && <img src={imgPreview} alt="" className="w-9 h-9 rounded-[8px] object-cover" />}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="py-2.5 rounded-[14px] text-glass-strong text-[14px] glass active:scale-95 transition"
            >
              取消
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!form.name || (form.price ?? 0) <= 0}
              className="py-2.5 rounded-[14px] text-white text-[14px] font-medium active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-accent-primary)' }}
            >
              {saved ? '已保存 ✓' : editingId != null ? '保存修改' : '保存周边'}
            </button>
          </div>
        </div>
      )}

      {list.length > 0 && !showForm && (
        <button
          type="button"
          onClick={openAdd}
          className="glass w-full rounded-card py-3 text-[13px] text-glass-strong active:scale-[0.99] transition mt-3"
        >
          + 添加周边
        </button>
      )}
    </div>
  )
}
