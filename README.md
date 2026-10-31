# HuuTai Tran — Portfolio

Portfolio de **HuuTai Tran**, photographe et développeur web. Le site a un style sombre et éditorial, et il est disponible en français et en anglais.

Il est développé avec **Angular 21** (SSR, prérendu, signals, zoneless) et déployé en statique sur **Cloudflare** (`wrangler.jsonc`).

## Pages

| Route | Contenu |
|---|---|
| `/` | Accueil avec les liens animés « Photography \| Web development » |
| `/photography` | Galerie photo avec visionneuse plein écran |
| `/web_development` | Projets web |
| `/shop` | Boutique : onglets « Tirages \| Livres » |
| `/shop/:id` | Fiche produit : un tirage (`frame_1`…) avec ses dimensions et son cadre, ou un livre (`book_1`…) avec son carrousel et sa quantité |
| `/shop/cart` | Panier, gardé 30 min dans le navigateur. Le paiement n'est pas encore actif |

## Prérequis

- Node.js 20 ou plus récent (22 recommandé)
- npm

```bash
npm install
```

## Commandes

| Commande | Rôle |
|---|---|
| `npm start` | Serveur de développement sur http://localhost:4200 |
| `npm test` | Tests unitaires (Vitest). Ajouter `-- --watch=false` pour une seule exécution |
| `npm run build` | Build de production avec prérendu de toutes les pages, dans `dist/huutaitran/` |
| `npm run watch` | Build de développement en continu |
| `npm run serve:ssr:huutaitran` | Sert le build SSR en local (à lancer après `npm run build`) |
| `npm run optimize:images` | Génère les images optimisées de la boutique (voir ci-dessous) |

## Images

Toutes les images sont dans `public/images/`, avec un dossier par page :

```
public/images/
├── photography/        # Page /photography
├── work_development/   # Page /web_development
└── products/           # Boutique : tirages (frames/) et livres (books/)
```

Chaque dossier suit la même logique :

- `original/` : fichiers maîtres (JPG/PNG), servent d'archive. Ils ne sont **pas** copiés dans le build.
- `converted_webp/` : versions WebP (1600 px de large maximum).

### Photographie

- Les photos sont dans `public/images/photography/converted_webp/huutaitran - N.webp`.
- Pour en ajouter, mets à jour `TOTAL_PHOTOS` dans `src/app/services/photos.service.ts`.

### Développement web

- Les captures des projets sont dans `public/images/work_development/converted_webp/`.
- Elles sont référencées dans `src/app/pages/web-development/web-development.component.ts`.

### Boutique

Pour les produits de la boutique, les fichiers de `converted_webp/` servent uniquement de **sources**. Le site affiche les versions générées par le script :

```
public/images/products/
├── frames/                    # Tirages
│   ├── original/              # Archive
│   ├── converted_webp/        # Sources : "frame - N.webp"
│   ├── web/                   # Généré (1600 px), pour la fiche produit
│   └── thumbs/                # Généré (800 px), pour la grille et le panier
└── books/                     # Livres
    ├── original/
    ├── converted_webp/        # Sources : "book N - 1.webp", "book N - 2.webp", …
    ├── web/                   # Généré, pour le carrousel
    └── thumbs/                # Généré, pour la couverture, les miniatures et le panier
```

> ⚠️ **Après chaque ajout ou modification d'une photo dans `products/*/converted_webp/`, lance :**
>
> ```bash
> npm run optimize:images
> ```
>
> Le script ne régénère que les images nouvelles ou modifiées. Il faut ensuite commiter les dossiers `web/` et `thumbs/`, dont le site a besoin.
>
> Ce script ne concerne que la boutique. Pour `photography/` et `work_development/`, il suffit d'exporter les photos directement en WebP (1600 px de large maximum) dans `converted_webp/`.

### Ajouter un produit

Dans les deux cas, lance `npm run optimize:images` après avoir ajouté les photos.

**Un tirage**
1. Ajoute `frame - N.webp` dans `products/frames/converted_webp/`.
2. Mets à jour `TOTAL_PRODUCTS` dans `src/app/services/shop.service.ts`.

**Un livre**
1. Ajoute `book N - 1.webp`, `book N - 2.webp`, … dans `products/books/converted_webp/`. La première photo sert de couverture.
2. Ajoute une entrée dans `BOOK_DEFINITIONS` (`src/app/services/shop.service.ts`) avec `number`, `imageCount`, `title`, `description` (en EN et FR) et `price`.

Les pages produit sont prérendues automatiquement (`src/app/app.routes.server.ts`).

## Structure

```
src/app/
├── components/   # navbar, loader, galerie, lightbox, about
├── pages/        # home, photography, web-development, shop (+ product, book, cart)
├── services/     # language (traductions EN/FR), photos, shop (catalogue), cart (panier)
└── utils/        # text-scrambler (animation de texte « cryptage »)
scripts/
└── optimize-shop-images.mjs
```

## Déploiement

Le site est servi par Cloudflare depuis `dist/huutaitran/browser` (voir `wrangler.jsonc`). Pour un déploiement manuel :

```bash
npm run build
npx wrangler deploy
```
