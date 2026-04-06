import { useState } from 'react'

const MOCK_GALLERY_ITEMS = [
  {
    id: 1,
    name: 'mountain.jpg',
    url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 2,
    name: 'city.jpg',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 3,
    name: 'forest.jpg',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 4,
    name: 'coast.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 5,
    name: 'desert.jpg',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 6,
    name: 'lake.jpg',
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=80',
  },
]

function Gallery({ items = MOCK_GALLERY_ITEMS, enableLightbox = true }) {
  const [activeImage, setActiveImage] = useState(null)

  const handleImageClick = (item) => {
    if (!enableLightbox) {
      return
    }

    setActiveImage(item)
  }

  return (
    <section className="glass-card rounded-2xl p-6">
      <h2 className="section-title">Gallery</h2>
      <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <figure
            key={item.id}
            className="group overflow-hidden rounded-xl border border-slate-700 bg-slate-950/60 shadow-lg shadow-black/20"
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => handleImageClick(item)}
            >
              <img
                src={item.url}
                alt={item.name}
                className="h-32 w-full object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-125"
                loading="lazy"
              />
              <figcaption className="truncate px-3 py-2 text-xs font-medium text-slate-300">
                {item.name}
              </figcaption>
            </button>
          </figure>
        ))}
      </div>

      {enableLightbox && activeImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          role="button"
          tabIndex={0}
          onClick={() => setActiveImage(null)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
              setActiveImage(null)
            }
          }}
        >
          <div
            className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <img
              src={activeImage.url}
              alt={activeImage.name}
              className="max-h-[76vh] w-full object-contain bg-slate-950"
            />
            <div className="flex items-center justify-between border-t border-slate-700 px-4 py-2.5 text-sm text-slate-200">
              <span>{activeImage.name}</span>
              <button
                type="button"
                className="rounded-md border border-slate-600 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-400 hover:text-white"
                onClick={() => setActiveImage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default Gallery
