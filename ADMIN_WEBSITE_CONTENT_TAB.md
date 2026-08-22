# Admin: Website Content tab (Frontend brief)

> **Scope:** New admin sidebar tab — **not** inside the existing System Settings page.  
> **Goal:** Let admins edit storefront content that now lives behind the backend settings/content APIs.  
> **Audience:** Frontend / admin UI.

---

## 1. Navigation & routing

| Item | Value |
|------|--------|
| Suggested label (EN) | **Website Content** |
| Suggested label (AR) | **محتوى الموقع** |
| Suggested path | `/admin/website-content` |
| Constant | `ADMIN_WEBSITE_CONTENT_PATH` in `src/config/routes.ts` |
| Sidebar | New item in `adminNav` (separate from Settings) |
| Page | `AdminWebsiteContentPage.tsx` |

**Keep existing Settings as-is** (payments, coupons, offers, banners, roles, cart recovery).

---

## 2. Page layout (recommended)

Single page with **internal tabs** (or accordion cards):

1. Contact info  
2. Social links  
3. Instagram grid  
4. How it works  
5. Content pages (About + policies)

Auth: all write calls need admin Bearer token (same pattern as other admin APIs).

Base API: `/api/v1` (same client as the rest of the app).

---

## 3. Tab A — Contact info

### Appears on storefront
- Home Contact section (`#contact`)
- WhatsApp icon (only if `whatsapp` is set)

### APIs
| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/settings/contact` | Load form |
| `PUT` | `/settings/contact` | Save (JSON) |

### Payload
```json
{
  "phone": "080 152 111 55 17",
  "email": "contact@oxilla.com",
  "location": "Texas, USA",
  "whatsapp": "+2010xxxxxxxx"
}
```

### Response extras
- `whatsappUrl` — ready `https://wa.me/...` link (read-only; do not send on PUT)

### UI
- Inputs: phone, email, location, whatsapp  
- Hint under WhatsApp: use international format (`+20…`)  
- Save button + toast success/error  

---

## 4. Tab B — Social links

### Appears on storefront
- Footer social icons

### APIs
| Method | Path |
|--------|------|
| `GET` | `/settings/social` |
| `PUT` | `/settings/social` |

### Payload
```json
{
  "facebook": "https://facebook.com/...",
  "twitter": "https://x.com/...",
  "instagram": "https://instagram.com/...",
  "linkedin": "https://linkedin.com/...",
  "youtube": "https://youtube.com/..."
}
```

### UI
- 5 URL inputs  
- Empty string clears a link  
- Validate URL client-side before submit  

---

## 5. Tab C — Instagram grid

### Appears on storefront
- Footer “Follow on Instagram” 2×2 grid

### APIs
| Method | Path | Body |
|--------|------|------|
| `GET` | `/settings/instagram` | — |
| `PUT` | `/settings/instagram` | JSON **or** `multipart/form-data` |

### Response shape
```json
[
  { "index": 0, "image": "https://...", "postUrl": "https://...", "alt": "..." },
  { "index": 1, "image": "...", "postUrl": "...", "alt": "..." },
  { "index": 2, "image": "...", "postUrl": "...", "alt": "..." },
  { "index": 3, "image": "...", "postUrl": "...", "alt": "..." }
]
```

### Update options
**JSON:**
```json
{
  "posts": [
    { "image": "https://...", "postUrl": "https://...", "alt": "..." },
    { "image": "https://...", "postUrl": "https://...", "alt": "..." },
    { "image": "https://...", "postUrl": "https://...", "alt": "..." },
    { "image": "https://...", "postUrl": "https://...", "alt": "..." }
  ]
}
```

**Multipart (preferred for uploads):**
- Fields: `posts` (JSON string) **or** per-slot text fields  
- Files: `instagramImage0` … `instagramImage3`

### UI
- Exactly **4** cards  
- Each: image preview + file upload + post URL + alt text  
- Must always submit 4 items  

---

## 6. Tab D — How it works

### Appears on storefront
- Landing “How it works” section

### APIs
| Method | Path | Body |
|--------|------|------|
| `GET` | `/settings/how-it-works` | — |
| `PUT` | `/settings/how-it-works` | JSON or multipart |

### Payload
```json
{
  "title": "How it works",
  "thumbnailImage": "https://...",
  "videoUrl": "https://...",
  "steps": [
    { "title": "Choose Your Skin Concern", "description": "..." },
    { "title": "Get Clear, Doctor-Based Explanations", "description": "..." },
    { "title": "One Step Checkout & Delivery", "description": "..." }
  ]
}
```

### Multipart
- File field: `thumbnailImage` (image upload)  
- Other fields as form fields / JSON string for `steps`

### UI
- Title, video URL, thumbnail upload/preview  
- Exactly **3** steps (title + description)  
- Response steps include `index` (0–2)  

---

## 7. Tab E — Content pages (About + policies)

### Appears on storefront
| Slug | Storefront use |
|------|----------------|
| `about` | About page (currently `/docs`) |
| `terms` | Footer → Terms |
| `privacy` | Footer → Privacy |
| `refund-policy` | Footer → Refunds |
| `shipping-policy` | Footer → Shipping |

### APIs
| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/settings/pages` | List (published) |
| `GET` | `/settings/pages?includeDrafts=true` | Admin list including drafts |
| `GET` | `/settings/pages/:slug` | Full page |
| `PUT` | `/settings/pages/:slug` | Update |

### Valid slugs
`about` | `terms` | `privacy` | `refund-policy` | `shipping-policy`

### About payload
```json
{
  "title": "About Oxxila",
  "subtitle": "...",
  "content": "",
  "isPublished": true,
  "sections": [
    { "key": "intro", "title": "...", "body": "...", "image": "" },
    { "key": "quality", "title": "...", "body": "...", "image": "" }
  ]
}
```

Default About section keys (seeded):  
`intro`, `quality`, `medical`, `infrastructure`, `authenticity`

### Policy payload (terms / privacy / refund / shipping)
```json
{
  "title": "Terms & Conditions",
  "subtitle": "",
  "content": "<p>Full policy HTML or plain text…</p>",
  "sections": [],
  "isPublished": true
}
```

### Optional image upload on PUT
- File: `sectionImage`  
- Field: `sectionKey` (must match an existing section `key`)

### UI suggestion
1. Left: list of 5 pages (from `GET /settings/pages?includeDrafts=true`)  
2. Right: editor for selected slug  
3. About → section list editor  
4. Policies → title + rich text / textarea for `content`  
5. Toggle `isPublished`  
6. Save → `PUT /settings/pages/:slug`

---

## 8. Suggested frontend files

```
src/config/routes.ts                    # ADMIN_WEBSITE_CONTENT_PATH
src/components/admin/config/adminNav.ts # sidebar item
src/pages/admin/AdminWebsiteContentPage.tsx
src/api/admin/websiteContent.ts         # all fetch helpers
src/components/admin/website-content/
  ContactInfoCard.tsx
  SocialLinksCard.tsx
  InstagramGridCard.tsx
  HowItWorksCard.tsx
  ContentPagesCard.tsx
```

---

## 9. API client sketch

```ts
// src/api/admin/websiteContent.ts
getContactSettings()
updateContactSettings(payload)

getSocialSettings()
updateSocialSettings(payload)

getInstagramSettings()
updateInstagramSettings(payload | FormData)

getHowItWorksSettings()
updateHowItWorksSettings(payload | FormData)

listContentPages(includeDrafts?: boolean)
getContentPage(slug)
updateContentPage(slug, payload | FormData)
```

Use existing `apiRequest` with `auth: true` for PUT.

---

## 10. Storefront follow-up (out of this tab, but related)

After admin UI ships, storefront should read:

| Area | Endpoint |
|------|----------|
| Contact + WhatsApp | `GET /settings/contact` |
| Footer social | `GET /settings/social` |
| Instagram grid | `GET /settings/instagram` |
| How it works | `GET /settings/how-it-works` |
| About page | `GET /settings/pages/about` |
| Policy pages | `GET /settings/pages/:slug` |
| Footer links | wire to `/about`, `/terms`, `/privacy`, `/refund-policy`, `/shipping-policy` |

---

## 11. Implementation order

1. Route + sidebar tab + empty page shell  
2. Contact (includes WhatsApp)  
3. Social  
4. Instagram grid  
5. How it works  
6. Content pages editor  

---

## 12. Out of scope for this tab

- Payment gateways, coupons, offers, banners, roles, cart recovery → stay under **Settings**  
- Contact form “Send message” (`POST /settings/contact/message`) → storefront only, not admin  

---

## 13. Quick acceptance checklist

- [ ] New sidebar item opens `/admin/website-content`  
- [ ] Contact save updates storefront phone/email/location/WhatsApp  
- [ ] Empty WhatsApp hides icon on storefront  
- [ ] Social links update footer icons  
- [ ] Instagram 4 slots upload + post URLs work  
- [ ] How it works 3 steps + media save correctly  
- [ ] About sections editable  
- [ ] Each policy page editable independently  
- [ ] `isPublished: false` hides page from public GET  
