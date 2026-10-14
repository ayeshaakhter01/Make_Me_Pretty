# Make Me Pretty

A React storefront rebuilt with Vite and Tailwind CSS, using the original Make Me Pretty design, product catalog, and media as the visual reference.

## Getting started

```sh
npm install
npm run dev
```

Run `npm run lint` to check the source and `npm run build` to create a production build. Use `npm run preview` to view that build locally.

## Project structure

```text
src/
  components/
    home/       homepage sections and carousels
    layout/     shared header, footer, and page layout
    products/   reusable catalog cards and product artwork
    ui/         shared buttons, icons, headings, and containers
  context/      shared cart state and cart hook
  data/         catalog and storefront content
  pages/        route-level pages
  App.jsx       route configuration and lazy-loaded pages
  main.jsx      React entry point and providers
  styles.css    Tailwind import, design tokens, and component effects
public/
  fonts/        Fraunces and Jost
  images/       logo and editorial photography
  media/        hero slides and brand logos
```

The catalog and artwork are front-end demo content. Checkout is a UI demo and does not submit orders or process payments. Browser routes use React Router; production hosting should serve `index.html` for application routes.
