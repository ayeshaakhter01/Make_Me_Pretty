import { KEYS } from '../admin/adminHelpers.js'
import { useStoredState } from '../admin/useStoredState.js'
import PageContainer from '../ui/PageContainer.jsx'

/* The banner picture under the menu on every shop page.
   The admin adds or removes it in the Banners tab. No picture saved = nothing is shown. */
export default function PageBanner() {
  const [image] = useStoredState(KEYS.pageHeader, '')
  if (!image) return null

  return (
    <PageContainer className="pt-4">
      <img src={image} alt="" aria-hidden="true" className="h-28 w-full rounded-3xl object-cover sm:h-40 md:h-52" />
    </PageContainer>
  )
}
