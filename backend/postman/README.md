# Postman API tests

API tests for the Make Me Pretty backend. Each teammate owns ONE Postman collection file. Inside a collection, Postman folders are the modules (`0 Setup`, `1 ...`, `2 ...`). Run a collection with the Collection Runner and save the green/red result screenshot in your own `screenshots/` folder.

## Folder tree

```
backend/postman/
├── README.md
└── collections/
    ├── ayesha/
    │   ├── Ayesha - Orders Payments Coupons Reports Share your experience contact .postman_collection.json
    │   └── screenshots/
    ├── fayeza/
    │   ├── Fayeza - Banners Blogs Shopping Orders Delivery.postman_collection.json
    │   └── screenshots/
    ├── fahmida/
    │   ├── Fahmida - Catalog Brands Policies Site Settings Skin Advisor.postman_collection.json
    │   └── screenshots/
    └── akhi/
        └── screenshots/     (add: Akhi - <modules>.postman_collection.json)
```

## Prerequisites

1. `backend/.env` is set and the backend runs (`npm run dev` in `backend/`) with MongoDB connected.
2. `npm run admin:create` has been run once, so an admin account exists.
3. A delivery partner user exists (create it in the website at Admin -> Users, role Delivery Partner). Only needed for collections that test delivery.

## How to import and run

1. Postman -> Import -> select your collection file.
2. Set the environment dropdown (top right) to **No Environment**.
3. Click the collection name -> **Variables** tab. Type your real admin / customer / delivery email and password in the **Current value** column only (never Initial value), then press Ctrl+S.
4. Hover over the collection -> `...` -> Run collection -> Run. Keep the request order as it is.
5. Take a screenshot of the result and save it in your own `screenshots/` folder.

Run order inside a collection: `0 Setup` first (it logs in and stores tokens), then the numbered module folders in order.

## Team rules

1. Always select **No Environment**. Postman environment variables override same-named collection variables, so an old `Local` environment would break the run. All collections here use collection variables only.
2. Real credentials go in the **Current value** column only. Never put them in Initial value.
3. Never commit credentials, tokens, or exported environments (the `.gitignore` blocks `*.postman_environment.json` under `postman/`).
4. File naming: `<Name> - <modules>.postman_collection.json`, kept inside your own folder.
5. Request naming: "Action + expected result", for example `Reject duplicate coupon code`. Every request has `pm.test` assertions.
6. Clean up the test data a run creates, at the end of the run.
7. After editing in Postman, Export (Collection v2.1) over the same file and commit on your own branch only. Do not edit another teammate's collection file.
8. Orders is shared between Ayesha and Fayeza. Ayesha covers COD order creation, idempotency, COD collection, and cancellation. Fayeza covers order status, tracking, customer cancel, and delivery assignment. Do not add the same request in both collections.

## Adding a new collection (checklist)

- Valid Postman Collection v2.1 file named `<Name> - <modules>.postman_collection.json`, placed in your own folder.
- A setup folder named like `0 Setup` that logs in and stores tokens, followed by numbered module folders.
- No `pm.environment` in any script. Every `{{variable}}` is declared in the collection's Variables tab or created by a script.
- Credential and token variables are empty (or clearly a placeholder). No real emails, passwords, tokens, or database URIs.
- Every request has `pm.test` assertions.
- Test data is cleaned up at the end of a run.
- No hard-coded emails, phone numbers, coupon codes, or idempotency keys that another collection could also use in the shared MongoDB database. Add a per-run suffix instead.

## Notes

- SSLCommerz requests marked `(manual)` need sandbox credentials in `backend/.env` and a public HTTPS tunnel for the callbacks. Run them by hand, not as part of an automatic full run.
- Public order tracking was removed from the backend (all `/api/orders` routes need a login), so the tracking request expects `401` without a token.
