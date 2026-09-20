import json

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hex_str):
    hex_str = hex_str.lstrip('#')
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b)

def contrast(c1, c2):
    l1 = luminance(c1)
    l2 = luminance(c2)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

base_light = {
    'surface': '#f7f2e8',
    'raised': '#fffdf6',
    'foreground': '#1a1d21',
    'muted': '#5c5a55',
    'structural': '#6b4a2b',
}

base_dark = {
    'surface': '#14171a',
    'raised': '#1e2327',
    'foreground': '#e6e9ec',
    'muted': '#a9b0b8',
    'structural': '#b9a68a',
}

palettes_light = {
    'forest': {'accent': '#2f5d3a', 'onAccent': '#ffffff', 'tint': '#cfe3bf', 'deep': '#2f5d3a'},
    'fire':   {'accent': '#c0392b', 'onAccent': '#ffffff', 'tint': '#fbe2df', 'deep': '#a8342e'},
    'ocean':  {'accent': '#2d79a6', 'onAccent': '#ffffff', 'tint': '#d8e9f1', 'deep': '#1f5d80'},
    'berry':  {'accent': '#b5356a', 'onAccent': '#ffffff', 'tint': '#f8dcea', 'deep': '#8e2953'},
    'sun':    {'accent': '#e9a23b', 'onAccent': '#3a2905', 'tint': '#f5e5c9', 'deep': '#7d5010'},
    'neutral':{'accent': '#4a4a42', 'onAccent': '#ffffff', 'tint': '#e8e3d6', 'deep': '#4a4a42'},
}

palettes_dark = {
    'forest': {'accent': '#7fd8a0', 'onAccent': '#06301a', 'tint': '#2c4636', 'deep': '#7fd8a0'},
    'fire':   {'accent': '#ff9f8a', 'onAccent': '#3a0d06', 'tint': '#4a2f2a', 'deep': '#ff9f8a'},
    'ocean':  {'accent': '#8fc4ff', 'onAccent': '#062146', 'tint': '#2b3c4f', 'deep': '#8fc4ff'},
    'berry':  {'accent': '#f0a6d0', 'onAccent': '#3d0a29', 'tint': '#46303e', 'deep': '#f0a6d0'},
    'sun':    {'accent': '#ffd86b', 'onAccent': '#3a2905', 'tint': '#453a24', 'deep': '#ffd86b'},
    'neutral':{'accent': '#c9d1d9', 'onAccent': '#14171a', 'tint': '#383d42', 'deep': '#c9d1d9'},
}

def check(name, rule_name, val, threshold):
    if val < threshold:
        print(f"FAIL: {name} - {rule_name}: {val:.2f} < {threshold}")

for mode, base, palettes in [('light', base_light, palettes_light), ('dark', base_dark, palettes_dark)]:
    print(f"\n--- {mode.upper()} ---")
    
    # 1. Structural on surface >= 4.5
    check(f"base", "structural on surface", contrast(base['structural'], base['surface']), 4.5)
    
    # 2. Structural on raised >= 4.5
    check(f"base", "structural on raised", contrast(base['structural'], base['raised']), 4.5)

    for p_name, p in palettes.items():
        # accent vs onAccent >= 4.5
        check(p_name, "accent vs onAccent", contrast(p['accent'], p['onAccent']), 4.5)
        
        # foreground vs tint >= 4.5
        check(p_name, "foreground on tint", contrast(base['foreground'], p['tint']), 4.5)
        
        # muted vs tint >= 4.5
        check(p_name, "muted on tint", contrast(base['muted'], p['tint']), 4.5)
        
        # deep vs tint >= 4.5
        check(p_name, "deep on tint", contrast(p['deep'], p['tint']), 4.5)
        
        # tint vs raised >= 1.2
        check(p_name, "tint vs raised", contrast(p['tint'], base['raised']), 1.2)
        
        # deep vs surface >= 4.5
        check(p_name, "deep on surface", contrast(p['deep'], base['surface']), 4.5)
        
        # deep vs raised >= 4.5
        check(p_name, "deep on raised", contrast(p['deep'], base['raised']), 4.5)
        
