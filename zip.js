/* Tiny dependency-free ZIP writer (store method) */
window.Zip = (function () {
  const tbl = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tbl[n] = c >>> 0; }
  const crc = b => { let c = ~0; for (let i = 0; i < b.length; i++) c = tbl[(c ^ b[i]) & 255] ^ (c >>> 8); return ~c >>> 0; };
  function make(files) {
    const enc = new TextEncoder(), parts = [], cd = [], d = new Date(); let off = 0;
    const dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(), tm = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    files.forEach(f => {
      const nm = enc.encode(f.n), data = typeof f.d === 'string' ? enc.encode(f.d) : f.d, c = crc(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x800, true); h.setUint16(10, tm, true); h.setUint16(12, dt, true);
      h.setUint32(14, c, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nm.length, true);
      parts.push(h.buffer, nm, data);
      const e = new DataView(new ArrayBuffer(46));
      e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint16(8, 0x800, true); e.setUint16(12, tm, true); e.setUint16(14, dt, true);
      e.setUint32(16, c, true); e.setUint32(20, data.length, true); e.setUint32(24, data.length, true); e.setUint16(28, nm.length, true); e.setUint32(42, off, true);
      cd.push(e.buffer, nm); off += 30 + nm.length + data.length;
    });
    const csz = cd.reduce((a, b) => a + b.byteLength, 0), end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, csz, true); end.setUint32(16, off, true);
    return new Blob([...parts, ...cd, end.buffer], { type: 'application/zip' });
  }
  return { make };
})();
