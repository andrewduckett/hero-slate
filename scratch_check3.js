function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}
function luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function contrast(hex1, hex2) {
    var rgb1 = hexToRgb(hex1);
    var rgb2 = hexToRgb(hex2);
    return (Math.max(luminance(rgb1.r, rgb1.g, rgb1.b), luminance(rgb2.r, rgb2.g, rgb2.b)) + 0.05) / (Math.min(luminance(rgb1.r, rgb1.g, rgb1.b), luminance(rgb2.r, rgb2.g, rgb2.b)) + 0.05);
}
const light = { surface: '#f7f2e8', raised: '#fffdf6',
    palettes: {
        forest: { tint: '#cfe3bf' },
        fire: { tint: '#fbe2df' },
        ocean: { tint: '#d8e9f1' },
        berry: { tint: '#f8dcea' },
        sun: { tint: '#f5e5c9' },
        neutral: { tint: '#e8e3d6' }
    }
};
const dark = { surface: '#14171a', raised: '#1e2327',
    palettes: {
        forest: { tint: '#2c4636' },
        fire: { tint: '#4a2f2a' },
        ocean: { tint: '#2b3c4f' },
        berry: { tint: '#46303e' },
        sun: { tint: '#453a24' },
        neutral: { tint: '#383d42' }
    }
};

for (let p in light.palettes) {
    console.log(`Light ${p} tint vs surface:`, contrast(light.palettes[p].tint, light.surface).toFixed(2));
}
for (let p in dark.palettes) {
    console.log(`Dark ${p} tint vs surface:`, contrast(dark.palettes[p].tint, dark.surface).toFixed(2));
}
