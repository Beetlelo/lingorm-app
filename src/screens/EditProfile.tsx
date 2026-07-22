import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, setProfile } from '../lib/profile'
import { fileToDataURL } from '../lib/image'

const DEFAULT_AVATAR = 'linear-gradient(135deg,#7C6CF0,#FF6FB5)'

export default function EditProfile() {
  const nav = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('星酱')
  const [bio, setBio] = useState('Lingorm 星球的星酱 ✨')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const p = getProfile()
    if (p.name) setName(p.name)
    if (p.bio) setBio(p.bio)
    if (p.avatar) setAvatar(p.avatar)
  }, [])

  async function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await fileToDataURL(file, 512)
      setAvatar(url)
      setSaved(false)
    } catch {
      /* 忽略读取失败 */
    }
    e.target.value = ''
  }

  function handleSave() {
    setProfile({ name, bio, avatar: avatar ?? undefined })
    setSaved(true)
  }

  return (
    <div className="-mt-1">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-bold text-glass-strong">编辑资料</h1>
        <button
          type="button"
          onClick={() => nav(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-glass-strong active:scale-95 transition"
          aria-label="返回"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div
          className="w-20 h-20 rounded-[32px] mb-3 ring-2 ring-white/30 bg-cover bg-center"
          style={avatar ? { backgroundImage: `url(${avatar})` } : { background: DEFAULT_AVATAR }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-[13px] text-accent active:scale-95 transition"
        >
          更换头像
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
      </div>

      <div className="glass-strong rounded-card p-4 space-y-4">
        <div>
          <label className="text-[12px] text-glass opacity-70 mb-1.5 block">昵称</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSaved(false)
            }}
            className="w-full bg-transparent border-b border-white/10 pb-2 text-[15px] text-glass-strong outline-none focus:border-accent-primary transition"
          />
        </div>
        <div>
          <label className="text-[12px] text-glass opacity-70 mb-1.5 block">个人简介</label>
          <input
            value={bio}
            onChange={(e) => {
              setBio(e.target.value)
              setSaved(false)
            }}
            className="w-full bg-transparent border-b border-white/10 pb-2 text-[15px] text-glass-strong outline-none focus:border-accent-primary transition"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full mt-6 py-3 rounded-[16px] text-white font-medium text-[15px] active:scale-95 transition"
        style={{ background: 'var(--color-accent-primary)' }}
      >
        {saved ? '已保存 ✓' : '保存'}
      </button>
    </div>
  )
}
