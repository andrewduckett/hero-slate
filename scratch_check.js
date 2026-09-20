function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(hex1, hex2) {
    var rgb1 = hexToRgb(hex1);
    var rgb2 = hexToRgb(hex2);
    var lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    var lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

const light = {
    surface: '#f7f2e8', // original surface
    raised: '#fffdf6',  // from proposal
    foreground: '#1a1d21', // original
    muted: '#5c5a55', // original
    structural: '#6b4a2b',
    palettes: {
        forest: { accent: '#2f5d3a', onAccent: '#ffffff', tint: '#cfe3bf', deep: '#2f5d3a' },
        fire: { accent: '#c0392b', onAccent: '#ffffff', tint: '#fbe2df', deep: '#a8342e' },
        ocean: { accent: '#2d79a6', onAccent: '#ffffff', tint: '#d8e9f1', deep: '#1f5d80' },
        berry: { accent: '#b5356a', onAccent: '#ffffff', tint: '#f8dcea', deep: '#8e2953' },
        sun: { accent: '#e9a23b', onAccent: '#3a2905', tint: '#f5e5c9', deep: '#7d5010' },
        neutral: { accent: '#4a4a42', onAccent: '#ffffff', tint: '#e8e3d6', deep: '#4a4a42' }
    }
};

const dark = {
    surface: '#14171a',
    raised: '#1e2327',
    foreground: '#e6e9ec',
    muted: '#a9b0b8',
    structural: '#b9a68a',
    palettes: {
        forest: { accent: '#7fd8a0', onAccent: '#06301a', tint: '#2c4636', deep: '#7fd8a0' },
        fire: { accent: '#ff9f8a', onAccent: '#3a0d06', tint: '#4a2f2a', deep: '#ff9f8a' },
        ocean: { accent: '#8fc4ff', onAccent: '#062146', tint: '#2b3c4f', deep: '#8fc4ff' },
        berry: { accent: '#f0a6d0', onAccent: '#3d0a29', tint: '#46303e', deep: '#f0a6d0' },
        sun: { accent: '#ffd86b', onAccent: '#3a2905', tint: '#453a24', deep: '#ffd86b' },
        neutral: { accent: '#c9d1d9', onAccent: '#14171a', tint: '#383d42', deep: '#c9d1d9' }
    }
};

let fails = 0;
function check(modeName, theme) {
    // Check structural
    let s_surf = contrast(theme.structural, theme.surface);
    let s_rais = contrast(theme.structural, theme.raised);
    if (s_surf < 4.5 || s_rais < 4.5) {
        console.log(`FAIL: structural ${theme.structural} on surface (${s_surf.toFixed(2)}) or raised (${s_rais.toFixed(2)})`);
        fails++;
    }

    for (let p in theme.palettes) {
        let colors = theme.palettes[p];
        let acc_on = contrast(colors.accent, colors.onAccent);
        if (acc_on < 4.5) { console.log(`FAIL [${modeName}]: ${p} onAccent on accent (${acc_on.toFixed(2)})`); fails++; }
        
        let fg_tint = contrast(theme.foreground, colors.tint);
        if (fg_tint < 4.5) { console.log(`FAIL [${modeName}]: ${p} foreground on tint (${fg_tint.toFixed(2)})`); fails++; }
        
        let muted_tint = contrast(theme.muted, colors.tint);
        if (muted_tint < 4.5) { console.log(`FAIL [${modeName}]: ${p} muted on tint (${muted_tint.toFixed(2)})`); fails++; }
        
        let deep_tint = contrast(colors.deep, colors.tint);
        if (deep_tint < 4.5) { console.log(`FAIL [${modeName}]: ${p} deep on tint (${deep_tint.toFixed(2)})`); fails++; }
        
        let deep_surf = contrast(colors.deep, theme.surface);
        if (deep_surf < 4.5) { console.log(`FAIL [${modeName}]: ${p} deep on surface (${deep_surf.toFixed(2)})`); fails++; }
        
        let deep_rais = contrast(colors.deep, theme.raised);
        if (deep_rais < 4.5) { console.log(`FAIL [${modeName}]: ${p} deep on raised (${deep_rais.toFixed(2)})`); fails++; }
        
        let tint_rais = contrast(colors.tint, theme.raised);
        if (tint_rais < 1.2) { console.log(`FAIL [${modeName}]: ${p} tint vs raised (${tint_rais.toFixed(2)})`); fails++; }
    }
}

check('light', light);
check('dark', dark);
console.log(`Total fails: ${fails}`);

