/* Starting content for the parts of the shop that the admin can edit.
   The shop pages and the admin screens both read these as the "first version";
   after the admin changes something, the saved version in the browser is used instead. */

/* HOMEPAGE HERO SLIDES (the big carousel at the top of the home page).
   type 'video' plays a video, type 'image' shows a picture.
   active = false hides a slide, so hiding the video turns the video off. */
export const SEED_HERO_SLIDES = [
  { id: 'hero-video', type: 'video', src: '/media/hero/MPM.mp4', title: '', subtitle: '', href: '/shop', active: true },
  { id: 'hero-brand', type: 'image', src: '/media/hero/brand.png', title: 'Glow, delivered', subtitle: 'Skincare you will love', href: '/shop', active: true },
  { id: 'hero-makeup', type: 'image', src: '/media/hero/photo2.jpg', title: 'New in Makeup', subtitle: 'Colour for every mood', href: '/makeup', active: true },
  { id: 'hero-offers', type: 'image', src: '/media/hero/offers.png', title: 'Glow for less', subtitle: 'Our favourite skincare at special prices', href: '/offers', active: true },
]

/* FOOTER: help links, policy links, social media and payment logos.
   Social names must match the icons in components/layout/socialIcons.jsx. */
export const SEED_FOOTER = {
  helpLinks: [
    { id: 'help-contact', label: 'Contact', href: '/p/contact' },
    { id: 'help-about', label: 'About Us', href: '/p/about-us' },
  ],
  policyLinks: [
    { id: 'policy-refund', label: 'Refund & Return Policy', href: '/p/refund-return' },
    { id: 'policy-privacy', label: 'Privacy Policy', href: '/p/privacy' },
    { id: 'policy-delivery', label: 'Delivery Policy', href: '/p/delivery' },
    { id: 'policy-terms', label: 'Terms & Condition', href: '/p/terms' },
  ],
  socials: [
    { name: 'Facebook', href: 'https://www.facebook.com/share/1GzwwLRMqB/?mibextid=wwXIfr', active: true },
    { name: 'Instagram', href: 'https://www.instagram.com/makemepretty24?igsh=bmF3MXowbGR4MmY=', active: true },
    { name: 'WhatsApp', href: 'https://wa.me/', active: true },
    { name: 'TikTok', href: 'https://www.tiktok.com/@make_me_pretty9?_r=1&_t=ZS-97weg3uXdzR', active: true },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/make-me-pretty-773652376?utm_source=share_via&utm_content=profile&utm_medium=member_ios', active: true },
  ],
  payments: [
    { id: 'pay-bkash', label: 'bKash', src: '/uploads/payment-logos/bKash.png' },
    { id: 'pay-visa', label: 'Visa', src: '/uploads/payment-logos/visa.png' },
    { id: 'pay-cod', label: 'Cash on Delivery', src: '/uploads/payment-logos/cod.png' },
  ],
}
