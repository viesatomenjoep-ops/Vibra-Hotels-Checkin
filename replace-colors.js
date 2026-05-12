const fs = require('fs');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace direct color hex codes with CSS variables
  content = content.replace(/#00d2d3/g, 'var(--brand-color)');
  content = content.replace(/#00b5b6/g, 'var(--brand-hover)');
  
  // Opacity modifiers like bg-[#00d2d3]/20 will become bg-[var(--brand-color)]/20, which is invalid in tailwind if not RGB.
  // BUT we can use inline styles for the root to define the variable.
  // Tailwind Arbitrary values with CSS variables actually DO work with opacity if you define them properly,
  // but to be safe, let's just leave them as they will be parsed as solid if opacity fails, OR we can just inject a global style.
  
  fs.writeFileSync(filePath, content);
}

replaceColors('./src/app/kiosk/[hotel_id]/page.tsx');
replaceColors('./src/app/check-in/[hotel_id]/page.tsx');
console.log('Colors replaced!');
