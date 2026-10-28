// Paste into the browser pane's javascript_tool after navigating to a recipe page.
// Use this when curl and WebFetch are blocked (Cloudflare, Serious Eats, etc.) --
// a real browser gets the page, and this returns the same fields extract_recipe.py does.
(() => {
  const out = [];
  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
    let d;
    try { d = JSON.parse(s.textContent); } catch (e) { continue; }
    const stack = [d];
    while (stack.length) {
      const n = stack.pop();
      if (Array.isArray(n)) { stack.push(...n); continue; }
      if (n && typeof n === 'object') {
        const t = n['@type'];
        if (t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'))) {
          out.push({
            name: n.name,
            description: n.description,
            yield: n.recipeYield,
            prep: n.prepTime, cook: n.cookTime, total: n.totalTime,
            cat: n.recipeCategory, cuisine: n.recipeCuisine, keywords: n.keywords,
            author: n.author && (n.author.name || n.author['@id']),
            ing: n.recipeIngredient,
            steps: (n.recipeInstructions || []).map(x =>
              typeof x === 'string' ? x : (x.text || (x.itemListElement || []).map(y => y.text).join(' | '))),
            nutrition: n.nutrition,
            image: Array.isArray(n.image) ? (n.image[0].url || n.image[0]) : ((n.image && n.image.url) || n.image)
          });
        }
        stack.push(...Object.values(n));
      }
    }
  }
  // Card notes and article notes, which structured data leaves out.
  const notes = [];
  const card = document.querySelector('.tasty-recipes-notes, .tasty-recipe-notes, .wprm-recipe-notes');
  if (card) notes.push('CARD NOTES: ' + card.innerText.replace(/\s+/g, ' ').trim().slice(0, 3000));
  document.querySelectorAll('h2,h3,h4,strong,dt').forEach(h => {
    const t = (h.textContent || '').trim();
    if (/^(special equipment|equipment|notes?|recipe notes|make.?ahead[^:]{0,30}|storage[^:]{0,30}|cook.s notes?)$/i.test(t)) {
      let el = h.nextElementSibling, buf = '';
      while (el && buf.length < 900 && !/^H[1-4]$/.test(el.tagName)) {
        buf += ' ' + el.textContent.trim();
        el = el.nextElementSibling;
      }
      notes.push(t + ': ' + buf.replace(/\s+/g, ' ').trim().slice(0, 900));
    }
  });
  return JSON.stringify({ recipes: out, notes }, null, 1);
})()
