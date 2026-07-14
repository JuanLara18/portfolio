// Minimal, dependency-free ZIP builder (STORE method, no compression).
// Good for bundling a handful of small text files (e.g. a series of markdowns)
// into a real .zip Blob entirely in the browser. No external library needed.

function crc32(bytes) {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (~crc) >>> 0;
}

const u32 = (view, off, val) => view.setUint32(off, val >>> 0, true);
const u16 = (view, off, val) => view.setUint16(off, val & 0xffff, true);

/**
 * Build a ZIP Blob from a list of text files.
 * @param {{name: string, text: string}[]} files
 * @returns {Blob}
 */
export function buildZip(files) {
  const enc = new TextEncoder();
  const entries = files.map((f) => ({
    nameBytes: enc.encode(f.name),
    data: enc.encode(f.text),
  }));

  const parts = [];
  const central = [];
  let offset = 0;

  entries.forEach((e) => {
    const crc = crc32(e.data);
    const size = e.data.length;
    const nameLen = e.nameBytes.length;

    // Local file header (30 bytes + filename)
    const header = new Uint8Array(30 + nameLen);
    const hv = new DataView(header.buffer);
    u32(hv, 0, 0x04034b50); // local file header signature
    u16(hv, 4, 20); // version needed to extract
    u16(hv, 6, 0x0800); // general purpose flag: UTF-8 filename
    u16(hv, 8, 0); // compression method: 0 = store
    u16(hv, 10, 0); // last mod time
    u16(hv, 12, 0); // last mod date
    u32(hv, 14, crc); // crc-32
    u32(hv, 18, size); // compressed size
    u32(hv, 22, size); // uncompressed size
    u16(hv, 26, nameLen); // filename length
    u16(hv, 28, 0); // extra field length
    header.set(e.nameBytes, 30);
    parts.push(header, e.data);

    // Central directory record (46 bytes + filename)
    const cd = new Uint8Array(46 + nameLen);
    const cv = new DataView(cd.buffer);
    u32(cv, 0, 0x02014b50); // central dir signature
    u16(cv, 4, 20); // version made by
    u16(cv, 6, 20); // version needed
    u16(cv, 8, 0x0800); // flag: UTF-8
    u16(cv, 10, 0); // compression store
    u16(cv, 12, 0); // mod time
    u16(cv, 14, 0); // mod date
    u32(cv, 16, crc);
    u32(cv, 20, size);
    u32(cv, 24, size);
    u16(cv, 28, nameLen);
    u16(cv, 30, 0); // extra len
    u16(cv, 32, 0); // comment len
    u16(cv, 34, 0); // disk number start
    u16(cv, 36, 0); // internal attrs
    u32(cv, 38, 0); // external attrs
    u32(cv, 42, offset); // relative offset of local header
    cd.set(e.nameBytes, 46);
    central.push(cd);

    offset += header.length + e.data.length;
  });

  const centralSize = central.reduce((n, c) => n + c.length, 0);
  const centralOffset = offset;

  // End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  u32(ev, 0, 0x06054b50);
  u16(ev, 4, 0); // disk number
  u16(ev, 6, 0); // disk with central dir
  u16(ev, 8, entries.length); // entries on this disk
  u16(ev, 10, entries.length); // total entries
  u32(ev, 12, centralSize);
  u32(ev, 16, centralOffset);
  u16(ev, 20, 0); // comment length

  return new Blob([...parts, ...central, eocd], { type: 'application/zip' });
}
