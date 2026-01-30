/**
 * Generate Shade Knowledge for AI Chatbot
 * 
 * This script categorizes nail polish shades by color family
 * so the chatbot can recommend specific shades based on user preferences.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ShadeInfo {
  hex: string;
  rgb: [number, number, number];
}

interface ShadeData {
  [key: string]: ShadeInfo;
}

// Load shade data
const shadePath = path.join(__dirname, '../app/data/shade_colors.json');
const shadeData: ShadeData = JSON.parse(fs.readFileSync(shadePath, 'utf-8'));

// Color classification based on RGB values
function classifyColor(rgb: [number, number, number]): string[] {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  const saturation = max === 0 ? 0 : (max - min) / max;
  const lightness = avg / 255;
  
  const categories: string[] = [];
  
  // Check for neutral/grey (low saturation) - more lenient threshold
  if (saturation < 0.25) {
    if (lightness > 0.8) categories.push('white', 'neutral');
    else if (lightness < 0.25) categories.push('black', 'dark');
    else categories.push('grey', 'neutral');
  }
  
  // Grey detection - check for muted colors where RGB values are close together
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff < 40 && avg > 60 && avg < 200) {
    categories.push('grey');
  }
  
  // Smoky/muted blues and greys
  if (b >= r && b >= g && saturation < 0.35 && lightness > 0.25 && lightness < 0.6) {
    categories.push('grey', 'smoky');
  }
  
  // Taupe/greige (grey-beige)
  if (r > g && g >= b && saturation < 0.3 && lightness > 0.3 && lightness < 0.6) {
    categories.push('grey', 'taupe', 'greige');
  }
  
  // Check dominant color
  if (r > g && r > b && saturation > 0.2) {
    if (r > 180 && g < 100 && b < 100) categories.push('red');
    else if (r > 180 && g > 100 && g < 180 && b < 150) categories.push('coral', 'orange');
    else if (r > 180 && b > 100) categories.push('pink');
    else if (r > 100 && g < 80 && b < 80) categories.push('burgundy', 'dark red');
  }
  
  if (g > r && g > b && saturation > 0.2) {
    categories.push('green');
    if (b > r) categories.push('teal');
  }
  
  if (b > r && b > g && saturation > 0.2) {
    categories.push('blue');
    if (r > g) categories.push('purple', 'violet');
  }
  
  // Pink detection (high red, medium-high blue, low green)
  if (r > 150 && b > 100 && g < r && g < b) {
    categories.push('pink');
    if (r > 200 && b > 150) categories.push('hot pink', 'fuchsia');
  }
  
  // Purple detection
  if (r > 80 && b > 80 && Math.abs(r - b) < 50 && g < Math.min(r, b)) {
    categories.push('purple', 'mauve');
  }
  
  // Nude/beige detection
  if (r > 180 && g > 150 && b > 130 && saturation < 0.3) {
    categories.push('nude', 'beige', 'natural');
  }
  
  // Brown detection
  if (r > g && g > b && r < 180 && saturation > 0.2 && saturation < 0.6) {
    categories.push('brown', 'taupe');
  }
  
  // Gold/metallic hints (yellowy-orange high values)
  if (r > 180 && g > 140 && b < 100) {
    categories.push('gold', 'bronze');
  }
  
  // Silver hint - more lenient
  if (saturation < 0.15 && avg > 120 && avg < 220) {
    categories.push('silver', 'grey');
  }
  
  // Dark colors
  if (lightness < 0.35) {
    categories.push('dark');
  }
  
  // Light/pastel colors
  if (lightness > 0.7 && saturation < 0.4) {
    categories.push('pastel', 'light');
  }
  
  return [...new Set(categories)];
}

// Categorize all shades
const colorFamilies: Record<string, string[]> = {
  'red': [],
  'pink': [],
  'coral': [],
  'orange': [],
  'nude': [],
  'beige': [],
  'brown': [],
  'burgundy': [],
  'purple': [],
  'mauve': [],
  'blue': [],
  'teal': [],
  'green': [],
  'grey': [],
  'silver': [],
  'black': [],
  'white': [],
  'gold': [],
  'neutral': [],
  'dark': [],
  'pastel': [],
  'smoky': [],
  'taupe': [],
  'greige': [],
};

// Process each shade
Object.entries(shadeData).forEach(([name, info]) => {
  const categories = classifyColor(info.rgb);
  categories.forEach(cat => {
    if (colorFamilies[cat]) {
      colorFamilies[cat].push(`${name} (${info.hex})`);
    }
  });
});

// Generate knowledge chunks
interface ShadeKnowledgeChunk {
  source: string;
  source_id: string;
  section: string;
  content: string;
  relatedProducts: string[];
}

const knowledgeChunks: ShadeKnowledgeChunk[] = [];

// Create chunks for each color family
Object.entries(colorFamilies).forEach(([color, shades]) => {
  if (shades.length > 0) {
    const uniqueShades = [...new Set(shades)].slice(0, 25); // Limit to prevent huge chunks
    
    knowledgeChunks.push({
      source: 'nail-shades',
      source_id: `shades-${color}`,
      section: 'Nail Colour',
      content: `MAVALA ${color.toUpperCase()} NAIL POLISH SHADES

Looking for ${color} nail polish? Here are Mavala's ${color} shades:

${uniqueShades.join('\n')}

All Mavala nail polishes are available in 5ml mini bottles ($9.95) and 10ml regular bottles ($13.95). They are 13-Free, toxic-free, cruelty-free, and allow nails to breathe naturally.

[Related Products: 5ml-bottles, 10ml-bottles]`,
      relatedProducts: ['5ml-bottles', '10ml-bottles']
    });
  }
});

// Add a general shade overview
const totalShades = Object.keys(shadeData).length;
knowledgeChunks.push({
  source: 'nail-shades',
  source_id: 'shades-overview',
  section: 'Nail Colour',
  content: `MAVALA NAIL POLISH SHADE COLLECTION

Mavala offers ${totalShades} beautiful nail polish shades across many color families:

- REDS: Classic reds, deep wines, and bright crimsons
- PINKS: From soft blush to hot pink and fuchsia
- NUDES & NEUTRALS: Beige, taupe, and natural tones
- PURPLES & MAUVES: Lavender, plum, and violet shades
- BLUES: From sky blue to navy and teal
- GREENS: Mint, olive, and emerald tones
- GREYS & SILVERS: Sophisticated neutral greys
- CORALS & ORANGES: Warm peachy and orange tones
- BROWNS: Chocolate, coffee, and earthy tones
- DARK SHADES: Burgundy, black, and deep dramatic colors
- PASTELS: Soft, muted spring colors

All shades are available in 5ml ($9.95) and 10ml ($13.95) bottles.
All formulas are 13-Free, toxic-free, and cruelty-free.

[Related Products: 5ml-bottles, 10ml-bottles]`,
  relatedProducts: ['5ml-bottles', '10ml-bottles']
});

// Print summary
console.log('\n=== SHADE KNOWLEDGE SUMMARY ===');
console.log(`Total shades: ${totalShades}`);
Object.entries(colorFamilies).forEach(([color, shades]) => {
  if (shades.length > 0) {
    console.log(`  ${color}: ${new Set(shades).size} shades`);
  }
});
console.log(`Total knowledge chunks: ${knowledgeChunks.length}`);

// Save to file
const outputPath = path.join(__dirname, '../app/data/shade-knowledge.json');
fs.writeFileSync(outputPath, JSON.stringify(knowledgeChunks, null, 2));
console.log(`\nShade knowledge saved to: ${outputPath}`);
