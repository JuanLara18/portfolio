--[[
  series.lua — the layout intelligence for the series PDF builder.

  Everything here is a decision that only matters on paper:

    * Diagrams are sized from their aspect ratio, so a 4:1 flowchart gets the
      full wide measure and a tall one is capped against the page height
      instead of running off the bottom.
    * Code overhangs into the outer margin, which is how a 124-character line
      survives a 112mm prose column.
    * Links become sidenotes or footnotes carrying the bare URL, because a blue
      underline is worthless in print. Links pointing at another part of the
      same compilation become "(Part 3)" cross-references instead.
    * Reference lists ("Going Deeper") get inline URLs rather than notes —
      twenty stacked margin notes would overflow the page.

  Metadata supplied by build.js:
    notes        "margin" | "foot"
    textwidth    prose measure, mm
    widewidth    text column plus permitted overhang, mm
    partmap      JSON object: post slug -> part number, for cross-references
    totalparts   number of level-1 headers, for "Part 2 of 5"
]]

local NOTES = 'foot'
local TEXTWIDTH = 112
local WIDEWIDTH = 168
local PARTMAP = {}
local TOTALPARTS = 0

-- A diagram at least this wide relative to its height gets its own rotated
-- page; below it, the wide measure is enough to keep labels legible.
local LANDSCAPE_ASPECT = 5.0
-- Above this, a diagram is landscape enough to earn the overhang.
local WIDE_ASPECT = 1.55
-- Kinds whose labels are placed relative to the chart box, so a narrow column
-- clips them whatever their aspect ratio says. Kept in step with build.js.
local WIDE_KINDS = {
  quadrantChart = true, timeline = true, gantt = true,
  journey = true, gitGraph = true, ['xychart-beta'] = true,
}
-- Fraction of the type area a diagram may occupy vertically. Tall diagrams are
-- height-bound rather than width-bound, so this number sets how large their
-- labels come out; at 0.74 a portrait flowchart floated onto its own page read
-- at about 5.5pt with a third of the page empty. LaTeX floats anything that no
-- longer fits, so there is no reason to hold back much below the full measure.
local MAX_DIAGRAM_HEIGHT_FRACTION = 0.92
local TEXTHEIGHT = 245

local part_index = 0

local function raw(s) return pandoc.RawInline('latex', s) end
local function rawb(s) return pandoc.RawBlock('latex', s) end

local function escape_url(url)
  -- \url is verbatim-ish but still chokes on % and #, which appear in the
  -- blog's own hash-router links (…/portfolio/#/blog/slug).
  return (url:gsub('([%%#])', '\\%1'))
end

--- The bare URL as a sidenote or footnote, per layout.
local function url_note(url)
  return raw('\\srcnote{' .. escape_url(url) .. '}')
end

--- `https://juanlara18.github.io/portfolio/#/blog/the-objective-has-a-shape`
--- → `the-objective-has-a-shape`, or nil for anything else.
local function blog_slug(url)
  return url:match('juanlara18%.github%.io/portfolio/#/blog/([%w%-]+)')
end

--- How a link renders depends on where it points and where it sits.
--- `style` is 'note' (body prose) or 'inline' (reference lists).
local function render_link(el, style)
  local url = el.target
  local slug = blog_slug(url)

  if slug and PARTMAP[slug] then
    -- Same compilation: a page reference beats a URL the reader cannot click.
    local out = el.content
    table.insert(out, raw('\\,(Part~' .. PARTMAP[slug] .. ')'))
    return out
  end

  if not url:match('^https?://') then
    return el.content -- anchors and relative links mean nothing on paper
  end

  local out = el.content
  if style == 'inline' then
    table.insert(out, raw('\\,{\\footnotesize\\hspace{0pt}\\url{' .. escape_url(url) .. '}}'))
  else
    table.insert(out, url_note(url))
  end
  return out
end

--- Strips links to plain text — for headers and table cells, where a note
--- would either break the TOC or float out of its cell.
local function flatten_links(el)
  return pandoc.walk_block(el, {
    Link = function(l) return l.content end,
  })
end

--- Replaces every Link inside a block using the given style.
local function resolve_links(el, style)
  return pandoc.walk_block(el, {
    Link = function(l) return render_link(l, style) end,
  })
end

-- ── Pass 1: contexts where the generic link rule must not apply ─────────────

local context_pass = {
  Header = function(el)
    return flatten_links(el)
  end,

  Table = function(el)
    -- Wide tables need the smaller size to stay inside the measure, and a
    -- sidenote anchored in a cell lands in the wrong place on the page.
    return pandoc.Blocks({
      rawb('\\begingroup\\footnotesize\\setlength{\\tabcolsep}{4pt}'),
      flatten_links(el),
      rawb('\\endgroup'),
    })
  end,

  BulletList = function(el) return resolve_links(el, 'inline') end,
  OrderedList = function(el) return resolve_links(el, 'inline') end,
  DefinitionList = function(el) return resolve_links(el, 'inline') end,
}

-- ── Pass 2: everything else ────────────────────────────────────────────────

local main_pass = {}

--- `<br/>` is the only raw HTML the posts actually use (364 occurrences).
function main_pass.RawInline(el)
  if el.format:match('html') then
    if el.text:match('^%s*<br%s*/?>%s*$') then return pandoc.LineBreak() end
    return {} -- drop any other stray HTML rather than leaking it into the PDF
  end
  return nil
end

function main_pass.Link(el)
  return render_link(el, 'note')
end

--- A lone image becomes a Figure block in pandoc 3.x, so the diagram has to be
--- caught at block level; digging it out here also covers the Para form that
--- older readers produce.
local function diagram_image(blocks_or_inlines, is_inline)
  local items = is_inline and blocks_or_inlines or nil
  if not is_inline then
    -- Figure content is Blocks: expect a single Plain/Para holding the image.
    if #blocks_or_inlines ~= 1 then return nil end
    local inner = blocks_or_inlines[1]
    if inner.t ~= 'Plain' and inner.t ~= 'Para' then return nil end
    items = inner.content
  end
  local found = nil
  for _, it in ipairs(items) do
    if it.t == 'Image' then
      if found or not it.classes:includes('diagram') then return nil end
      found = it
    elseif it.t ~= 'Space' and it.t ~= 'SoftBreak' then
      return nil
    end
  end
  return found
end

--- Pre-rendered Mermaid, injected by build.js as an image carrying its aspect.
local function render_diagram(el)
  local aspect = tonumber(el.attributes['data-aspect']) or 1.4
  local file = el.src:gsub('\\', '/')

  -- XeTeX cannot honour `keepaspectratio` alongside both a width and a height
  -- when the graphic is a PDF, so the fit is resolved here instead: pick the
  -- measure, and fall back to a height when that measure would run too tall.
  local function fit(avail_w, avail_h)
    if avail_w / aspect <= avail_h then
      return string.format('width=%.2fmm', avail_w)
    end
    return string.format('height=%.2fmm', avail_h)
  end

  if aspect >= LANDSCAPE_ASPECT then
    -- Too wide to stay legible even at full measure: give it a turned page,
    -- where the page's long edge becomes the available width.
    local box = fit(TEXTHEIGHT * 0.92, WIDEWIDTH * 0.86)
    return rawb(table.concat({
      '\\begin{landscape}\\begin{figure}[p]\\centering',
      '\\vspace*{\\fill}',
      '\\includegraphics[' .. box .. ']{' .. file .. '}',
      '\\vspace*{\\fill}',
      '\\end{figure}\\end{landscape}',
    }, '\n'))
  end

  local width = (aspect >= WIDE_ASPECT or WIDE_KINDS[el.attributes['data-kind']])
    and WIDEWIDTH or TEXTWIDTH
  local graphic = '\\includegraphics[' ..
    fit(width, TEXTHEIGHT * MAX_DIAGRAM_HEIGHT_FRACTION) .. ']{' .. file .. '}'

  -- \widebox rather than the widecontent environment: a list-based environment
  -- inside a float derails graphicx's argument scanning.
  local body = (aspect >= WIDE_ASPECT)
    and ('\\widebox{' .. graphic .. '}')
    or ('\\centering' .. graphic)

  return rawb(table.concat({
    '\\begin{figure}[htbp]',
    body,
    '\\end{figure}',
  }, '\n'))
end

function main_pass.Figure(el)
  local img = diagram_image(el.content, false)
  if not img then return nil end
  return render_diagram(img)
end

function main_pass.Para(el)
  local img = diagram_image(el.content, true)
  if not img then return nil end
  return render_diagram(img)
end

--- Code overhangs into the outer margin so long lines survive the narrow
--- prose measure. Returned as a list so pandoc still writes the highlighted
--- body itself — replacing the block wholesale would lose syntax colouring.
function main_pass.CodeBlock(el)
  return pandoc.Blocks({
    rawb('\\begin{widecontent}'),
    el,
    rawb('\\end{widecontent}'),
  })
end

--- Wraps a Div's own blocks in a LaTeX environment. The content list has to be
--- spliced in rather than nested, or pandoc rejects the result as a bare table.
local function wrap_blocks(content, env)
  local out = pandoc.Blocks({ rawb('\\begin{' .. env .. '}') })
  out:extend(content)
  out:insert(rawb('\\end{' .. env .. '}'))
  return out
end

function main_pass.Div(el)
  if el.classes:includes('postmeta') then return wrap_blocks(el.content, 'postmeta') end
  if el.classes:includes('excerpt') then return wrap_blocks(el.content, 'postexcerpt') end
  return nil
end

--- Numbers each post as a part of the compilation. Counting headers here
--- rather than baking numbers into the markdown keeps assembly dumb.
function main_pass.Header(el)
  if el.level ~= 1 then return nil end
  part_index = part_index + 1
  return pandoc.Blocks({
    rawb('\\seriespart{' .. part_index .. '}{' .. TOTALPARTS .. '}'),
    el,
  })
end

-- ── Entry point ────────────────────────────────────────────────────────────

local function read_meta(meta)
  if meta.notes then NOTES = pandoc.utils.stringify(meta.notes) end
  if meta.textwidth then TEXTWIDTH = tonumber(pandoc.utils.stringify(meta.textwidth)) end
  if meta.widewidth then WIDEWIDTH = tonumber(pandoc.utils.stringify(meta.widewidth)) end
  if meta.textheight then TEXTHEIGHT = tonumber(pandoc.utils.stringify(meta.textheight)) end
  if meta.totalparts then TOTALPARTS = tonumber(pandoc.utils.stringify(meta.totalparts)) end
  if meta.partmap then
    local ok, decoded = pcall(pandoc.json.decode, pandoc.utils.stringify(meta.partmap))
    if ok and type(decoded) == 'table' then PARTMAP = decoded end
  end
end

return {
  { Meta = function(m) read_meta(m); return m end },
  context_pass,
  main_pass,
}
