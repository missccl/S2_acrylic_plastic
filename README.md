# AcrylicNet Lab

Interactive simulator for **S2 Acrylic Plastic**: students visualise how sheet thickness changes 3D nets, cut lists, and the final clear inside of a product.

Paper / card nets hide thickness. Workshop acrylic (often **3 mm** or **5 mm**) does not — so designs that “fit on paper” can fail when laser-cut and assembled.

## What students can do

- Set a desired **clear inside** size for an open acrylic box
- Toggle **Plan for thickness** vs **Ignore thickness** (paper-style mistake)
- Switch thickness presets (0 / 1 / 3 / 5 mm)
- Inspect a **3D model**, **2D net**, and **laser cut list** together
- Follow a short lesson flow and reflection questions aligned with the worksheet

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## GitHub setup (first time)

Your project repo: `https://github.com/missccl/S2_acrylic_plastic`

### 1. Confirm the code is on GitHub

If you use Cursor Cloud / this PR workflow, merge the pull request into `main`, or push your branch and open a PR in the GitHub UI.

From your own computer (optional):

```bash
git clone https://github.com/missccl/S2_acrylic_plastic.git
cd S2_acrylic_plastic
npm install
npm run dev
```

### 2. Repo settings worth checking

1. Open the repo on GitHub → **Settings**
2. **Pages** is not required (Vercel will host the site)
3. Under **Collaborators**, add other teachers if they need edit access

### 3. Protect `main` (optional but good for class repos)

**Settings → Branches → Add rule** for `main`: require a pull request before merging.

## Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with **GitHub**
2. **Add New… → Project**
3. Import **`missccl/S2_acrylic_plastic`**
4. Framework preset should detect **Next.js** (leave defaults)
5. Click **Deploy**

After deploy:

- Every push to `main` updates production
- Every pull request gets a **Preview URL** you can share with students for testing

### Custom domain (optional)

Vercel → Project → **Settings → Domains** → add your school domain and follow DNS instructions.

## Teaching tip

1. Students design on paper first (0 mm in the lab)
2. Switch to **Ignore thickness** at 3 mm — discuss the lost clear space
3. Switch to **Plan for thickness** — copy the cut list onto the worksheet
4. Remind: finger / slot joints must match sheet thickness

## Note on the worksheet PDF

The file `Acrylic plastic.pdf` was referenced in the brief but was not available inside this Cloud Agent workspace. The lesson steps and reflection prompts follow typical S2 acrylic / 3D-net outcomes. If you re-attach the PDF, the lab copy can be tightened to match exact worksheet wording and product examples.

## Stack

- Next.js (App Router)
- SVG isometric box + 2D net (no WebGL — works on school Chromebooks)
- Tailwind CSS v4
- Deploy target: Vercel


## Vercel deploy notes

The npm lines about `eslint` being deprecated and `allow-scripts` / `unrs-resolver` are **warnings**, not the real failure by themselves.

This repo already includes:

- `"allowScripts": { "unrs-resolver": false }` in `package.json` (silences npm 12 script policy noise)
- `"engines": { "node": "24.x" }` so Vercel uses a supported Node version

If deploy still fails, open the Vercel build log and scroll past the yellow warnings to the first red **Error** line, then share that section.
