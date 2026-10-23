import ImageField from './ImageField.jsx'
import { card } from './adminHelpers.js'

/* SHOP LOOK: two pictures that change how the whole shop looks.
   logo        = the logo in the shop's top menu (empty = the original logo)
   headerImage = a banner picture shown under the menu on every shop page (empty = no picture) */
export default function SiteLookPanel({ logo, setLogo, headerImage, setHeaderImage }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <section className={`${card} p-5`}>
        <h3 className="font-serif text-lg">Menu logo</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">
          Shown at the left of the shop’s top menu. A PNG with a see-through background looks best.
          Remove the picture to go back to the original logo.
        </p>
        <ImageField
          images={logo ? [logo] : []}
          onChange={(list) => setLogo(list[0] ?? '')}
          max={1}
          maxSide={400}
          format="image/png"
          previewClass="h-16 w-40"
          fit="contain"
        />
      </section>

      <section className={`${card} p-5`}>
        <h3 className="font-serif text-lg">Page header picture</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">
          A wide banner picture shown at the top of every page of the shop, just under the menu
          (best size: 1600 × 400). Remove the picture to show no banner.
        </p>
        <ImageField
          images={headerImage ? [headerImage] : []}
          onChange={(list) => setHeaderImage(list[0] ?? '')}
          max={1}
          maxSide={1600}
          quality={0.7}
          previewClass="h-20 w-56"
        />
      </section>
    </div>
  )
}
