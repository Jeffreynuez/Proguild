# Proguild revamp

**Status: approved by Dannell and ported into this live repo on 13 October 2026** (branch `revamp`, then merged to `main`, which deploys proguildfm.com). It is now indexable (`global.noindex` false). The pictures and videos stayed in the repo under `assets/img/revamp/` and `assets/video/revamp/` rather than moving to Cloudinary, and the AI notes stayed. Her one copy change: the contact section's lead now reads "Send a request and a coordinator will follow up promptly or call us — someone always answers." The side repo `Jeffreynuez/Proguild-Revamp` and Vercel project `proguild-revamp` were the preview and can be retired once this is live.

A side build of proguildfm.com that Jeffrey is making for Dannell for free: the same site and the same CMS structure, with a much more visual home page. It lives in its own repo (`Jeffreynuez/Proguild-Revamp`) and Vercel project (`proguild-revamp`) until she decides. It is hidden from search engines while it is a preview (`global.noindex` in `data/pages.json`).

## What changed from the live site

| Section | Before | Now |
|---|---|---|
| Hero | Static headline over a photo | Headline words rise in one by one over a looping background video: the Tempe Town Lake photo brought to life, three calm US city scenes and three facility repair jobs by Proguild crew (servicing an air handler in a mechanical room, testing breakers in an electrical room, fitting an LED ceiling light in a lobby) (`video`, `videoMobile`). The photo stays underneath and shows first; the video fades in after the page has loaded |
| Why Choose Us | Icon cards with text | Photo cards that play short silent clips while on screen (`poster` + `video` per item); the promise slides up on hover, or mid-screen on phones |
| Company Principles | Icon cards with text | Photo tiles in a mixed grid with a short line each (`image`, `tagline`); the full sentence shows on hover |
| How It Works | Line that draws in | Pinned scroll story on desktop: a work order card travels the line, a clock fills at step 2, a truck drives step 3, a sign-off checklist ticks at step 4 (`ticketTitle`, `ticketDetail`, `checklist`). Phones get a vertical timeline |
| Our Services | Grid of 12 icon cards | Building explorer: a hotspot per service on the building picture (`x`, `y` in percent), a detail card, filter chips that dim other hotspots, a pill list, and Request this service, which fills the new Service needed field in the contact form |
| Coverage map | States colored on load | States rise and fill in a wave from the Chandler headquarters pin, with a states covered counter (`hqLabel`, `hqCity`, `counterLabel`) |
| Whole page | | `body{overflow-x:clip}` replaces `hidden`, which had been breaking the sticky header |

New files: `assets/css/revamp.css`, `assets/js/revamp.js`, `assets/img/revamp/`, `assets/video/revamp/`. Every new field is in `data/_schema.json`, so the CMS drawer can edit it. All motion stops for people who ask their device for reduced motion, and nothing animates inside the CMS visual editor (`?edit=1`).

## Pictures

AI generated. The first round came from Jeffrey's ComfyUI (Z-Image Turbo stills, Wan 2.2 clips, RIFE); on 12 October 2026 every picture with people in it was remade in Adobe Firefly (Firefly stills, and video clips made from those stills in Firefly, 24 frames a second), keeping the four calm city scenes in the hero. The hero's first scene is Dannell's own lake photo, animated. Everyone in Proguild workwear wears the real uniform: a black or dark gray shirt with the logo on the left chest. The shirts are generated plain and the real logo is put on afterwards, never drawn by the AI: warped and shaded into the fabric so it sits on the shirt rather than floating in front of it (`Revamp art\tools\fabric_logo.py`, placed per still with `still_logo.py`). In the clips the chest is tracked against the first frame on every frame so the logo stays put as people move and turn (`track_logo.py`, and `two_anchor.py` for the lighting clip, where the arms come down fast). Where the left chest faces away from the camera (the electrical clip) there is no logo to see, which is correct. Customer Focus uses the top half of its still so both faces stay in the wide tile. The phone in Effective Communication shows a real Proguild work order update built in HTML (`Revamp art\firefly\ui\screen.html`) and set onto the screen with `phone_screen.py`. Sources and specs: `Revamp art\firefly\`.

The background video is only fetched after the page loads, and not at all for visitors who ask their device for reduced motion or to save data; phones get a tall cut. The loop is about 31 seconds and ends where it began, so the repeat is invisible. Sources live outside the repo in `3 Completed websites\Proguild\Revamp art\`.

## If Dannell says yes

Merge this repo's changes into `Jeffreynuez/Proguild`, set `global.noindex` to `false`, move the pictures to Cloudinary (`dlgc3fj6w`, `proguild/`), and keep the live Vercel project, domain and CMS registration as they are.
