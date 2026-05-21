import { View } from "react-native";

/**
 * REVIVE wordmark — custom-drawn with positioned strokes to match the brand's
 * stylized aesthetic: thin sans-serif, ≡-style E's, "/" as I, clean V's.
 * Sharp at any size. Supports a per-letter color gradient for a logo feel.
 */
/** Official Revive brand gradient: deep charcoal → deep navy. */
export const REVIVE_BRAND_GRADIENT: [string, string] = ["#1F1C18", "#1E3A8A"];

export function ReviveWordmark({
  size = 48,
  /** Single color override. Ignored if `gradient` is set or default is used. */
  color,
  /** Two-color gradient applied left-to-right across the wordmark.
   *  Defaults to REVIVE_BRAND_GRADIENT (official brand mark). */
  gradient = REVIVE_BRAND_GRADIENT,
  letterSpacing = 0.18,
}: {
  size?: number;
  color?: string;
  gradient?: [string, string] | null;
  letterSpacing?: number;
}) {
  const sw = Math.max(1.8, size * 0.07);
  const gap = size * letterSpacing;

  // Build per-letter colors. If gradient given, interpolate; else use single color.
  const letterColors = gradient
    ? Array.from({ length: 6 }, (_, i) => lerpColor(gradient[0], gradient[1], i / 5))
    : Array(6).fill(color || "#2D2A24");

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap }}>
      <R    size={size} sw={sw} color={letterColors[0]} />
      <E    size={size} sw={sw} color={letterColors[1]} />
      <V    size={size} sw={sw} color={letterColors[2]} />
      <Slsh size={size} sw={sw} color={letterColors[3]} />
      <V    size={size} sw={sw} color={letterColors[4]} />
      <E    size={size} sw={sw} color={letterColors[5]} />
    </View>
  );
}

// ─── Color interpolation ─────────────────────────────────────────────────
function lerpColor(c1: string, c2: string, t: number): string {
  const hexToRgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ─── Stroke primitive ────────────────────────────────────────────────────
function Stroke({ x1, y1, x2, y2, sw, color }: {
  x1: number; y1: number; x2: number; y2: number; sw: number; color: string;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return (
    <View
      style={{
        position: "absolute",
        left: x1,
        top: y1 - sw / 2,
        width: length,
        height: sw,
        backgroundColor: color,
        borderRadius: sw / 2,
        transform: [
          { translateX: -length / 2 },
          { rotate: `${angle}deg` },
          { translateX: length / 2 },
        ],
      }}
    />
  );
}

// ─── Letter components ────────────────────────────────────────────────────

function R({ size, sw, color }: { size: number; sw: number; color: string }) {
  const w = size * 0.62;
  const h = size;
  const midY = h * 0.5;
  return (
    <View style={{ width: w, height: h }}>
      <Stroke x1={sw/2} y1={0}     x2={sw/2}    y2={h}        sw={sw} color={color} />
      <Stroke x1={sw/2} y1={sw/2}  x2={w-sw/2}  y2={sw/2}     sw={sw} color={color} />
      <Stroke x1={w-sw/2} y1={sw/2} x2={w-sw/2} y2={midY}     sw={sw} color={color} />
      <Stroke x1={sw/2} y1={midY}  x2={w-sw/2}  y2={midY}     sw={sw} color={color} />
      <Stroke x1={sw}   y1={midY}  x2={w-sw/2}  y2={h-sw/2}   sw={sw} color={color} />
    </View>
  );
}

function E({ size, sw, color }: { size: number; sw: number; color: string }) {
  const w = size * 0.55;
  const h = size;
  const midBarLen = w * 0.7;
  return (
    <View style={{ width: w, height: h }}>
      <Stroke x1={0} y1={sw/2}     x2={w}         y2={sw/2}    sw={sw} color={color} />
      <Stroke x1={0} y1={h/2}      x2={midBarLen} y2={h/2}     sw={sw} color={color} />
      <Stroke x1={0} y1={h-sw/2}   x2={w}         y2={h-sw/2}  sw={sw} color={color} />
    </View>
  );
}

function V({ size, sw, color }: { size: number; sw: number; color: string }) {
  const w = size * 0.62;
  const h = size;
  return (
    <View style={{ width: w, height: h }}>
      <Stroke x1={sw/2}     y1={0} x2={w/2} y2={h-sw/2} sw={sw} color={color} />
      <Stroke x1={w-sw/2}   y1={0} x2={w/2} y2={h-sw/2} sw={sw} color={color} />
    </View>
  );
}

function Slsh({ size, sw, color }: { size: number; sw: number; color: string }) {
  const w = size * 0.34;
  const h = size;
  return (
    <View style={{ width: w, height: h }}>
      <Stroke x1={sw/2} y1={h-sw/2} x2={w-sw/2} y2={sw/2} sw={sw} color={color} />
    </View>
  );
}
