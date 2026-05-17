/**
 * Mã hóa/obfuscate API key cho client-side (không thay thế bảo mật server).
 * Chỉ làm khó đọc key trực tiếp trên repo — vẫn giải mã được trong trình duyệt.
 */
const ConfigCodec = {
  SALT: "CineHub_tmdb_v1",

  decode(encoded) {
    if (!encoded) return "";
    try {
      const raw = atob(encoded);
      return [...raw]
        .map((c, i) =>
          String.fromCharCode(
            c.charCodeAt(0) ^ this.SALT.charCodeAt(i % this.SALT.length)
          )
        )
        .join("");
    } catch {
      return "";
    }
  },

  encode(plain) {
    if (!plain) return "";
    const xored = [...plain]
      .map((c, i) =>
        String.fromCharCode(
          c.charCodeAt(0) ^ this.SALT.charCodeAt(i % this.SALT.length)
        )
      )
      .join("");
    return btoa(xored);
  },
};
