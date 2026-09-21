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
        return v <= 0.03928 ? v / 12.92 : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function contrast(hex1, hex2) {
    var rgb1 = hexToRgb(hex1);
    var rgb2 = hexToRgb(hex2);
    return (Math.max(luminance(rgb1.r, rgb1.g, rgb1.b), luminance(rgb2.r, rgb2.g, rgb2.b)) + 0.05) / (Math.min(luminance(rgb1.r, rgb1.g, rgb1.b), luminance(rgb2.r, rgb2.g, rgb2.b)) + 0.05);
}

console.log("Muted on raised: ", contrast('#5c5a55', '#fffdf6'));
