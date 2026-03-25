const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const iconMap = {
  // Ionicons
  '<Ionicons name="close"': '<X',
  '<Ionicons name="scan"': '<Scan',
  '<Ionicons name="leaf"': '<Leaf',
  '<Ionicons name="alert-circle"': '<AlertCircle',
  '<Ionicons name="alert-circle-outline"': '<AlertCircle',
  '<Ionicons name="notifications-off-outline"': '<BellOff',
  '<Ionicons name="arrow-back"': '<ArrowLeft',
  '<Ionicons name="camera"': '<Camera',
  '<Ionicons name="notifications-outline"': '<Bell',
  '<Ionicons name="search"': '<Search',
  '<Ionicons name="ellipsis-vertical"': '<MoreVertical',
  '<Ionicons name="play-circle"': '<PlayCircle',
  '<Ionicons name="mic"': '<Mic',
  '<Ionicons name="logo-google"': '<Chrome', // Fallback for google
  '<Ionicons name="mail"': '<Mail',

  // MaterialCommunityIcons
  '<MaterialCommunityIcons name="brain"': '<Brain',
  '<MaterialCommunityIcons name="arrow-left"': '<ArrowLeft',
  '<MaterialCommunityIcons name="share-variant"': '<Share2',
  '<MaterialCommunityIcons name="cart-outline"': '<ShoppingCart',
  '<MaterialCommunityIcons name="cart-plus"': '<ShoppingBag',
  '<MaterialCommunityIcons name="chevron-left"': '<ChevronLeft',
  '<MaterialCommunityIcons name="chevron-right"': '<ChevronRight',
  '<MaterialCommunityIcons name="weather-partly-cloudy"': '<CloudSun',
  '<MaterialCommunityIcons name="water-percent"': '<Droplets',
  '<MaterialCommunityIcons name="image-plus"': '<ImagePlus',

  // MaterialIcons
  '<MaterialIcons name="close"': '<X',
  '<MaterialIcons name="gps-fixed"': '<LocateFixed',
  '<MaterialIcons name="my-location"': '<Locate',
  '<MaterialIcons name="location-off"': '<MapPinOff',
  '<MaterialIcons name="place"': '<MapPin',
};

const importLucideMap = new Set(Object.values(iconMap).map(i => i.replace('<', '')));

// Replace dynamic icons strings in NotificationScreen.tsx
const dynamicReplacements = [
  { file: 'NotificationScreen.tsx', from: `alert: 'alert-circle'`, to: `alert: 'AlertCircle'` },
  { file: 'NotificationScreen.tsx', from: `market: 'trending-up'`, to: `market: 'TrendingUp'` },
  { file: 'NotificationScreen.tsx', from: `weather: 'partly-sunny'`, to: `weather: 'CloudSun'` },
  { file: 'NotificationScreen.tsx', from: `system: 'information-circle'`, to: `system: 'Info'` },
  { file: 'NotificationScreen.tsx', from: `<Ionicons name={TYPE_ICONS[item.type]}`, to: `const IconComp = (LucideIcons as any)[TYPE_ICONS[item.type]];\n                  <IconComp` }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Remove @expo/vector-icons imports
      if (content.includes(`from '@expo/vector-icons'`)) {
        content = content.replace(/import\s+{.*}\s+from\s+'@expo\/vector-icons';\n?/g, '');
        changed = true;
      }

      // Collect all Lucide icons needed in this file
      const usedIcons = new Set();
      
      for (const [key, value] of Object.entries(iconMap)) {
        if (content.includes(key)) {
          content = content.replaceAll(key, value);
          usedIcons.add(value.replace('<', ''));
          changed = true;
        }
      }

      // Dynamic replacements for specific files
      for (const rep of dynamicReplacements) {
        if (fullPath.endsWith(rep.file) && content.includes(rep.from)) {
          content = content.replace(rep.from, rep.to);
          changed = true;
        }
      }

      // Special case: CropIntroScreen uses `<MaterialCommunityIcons name={card.icon}`
      if (fullPath.endsWith('CropIntroScreen.tsx') && content.includes('<MaterialCommunityIcons name={card.icon}')) {
        content = content.replace('<MaterialCommunityIcons name={card.icon}', 'const IconComp = (LucideIcons as any)[card.icon];\n                <IconComp');
        changed = true;
      }

      // Special case: ui.tsx uses `<MaterialCommunityIcons name={icon}` 
      if (fullPath.endsWith('ui.tsx') && content.includes('<MaterialCommunityIcons name={icon}')) {
        content = content.replace('<MaterialCommunityIcons name={icon}', 'const IconComp = (LucideIcons as any)[icon];\n        <IconComp');
        changed = true;
      }
      
      // Special case: NotificationScreen.tsx wildcard import
      if (fullPath.endsWith('NotificationScreen.tsx') || fullPath.endsWith('CropIntroScreen.tsx') || fullPath.endsWith('ui.tsx')) {
         usedIcons.add('* as LucideIcons');
      }

      if (changed) {
        // Add Lucide import if needed
        if (usedIcons.size > 0) {
          const imports = Array.from(usedIcons);
          const hasWildcard = imports.includes('* as LucideIcons');
          let importStr = '';
          if (hasWildcard) {
             importStr = `import * as LucideIcons from 'lucide-react-native';\n`;
          } else {
             importStr = `import { ${Array.from(usedIcons).join(', ')} } from 'lucide-react-native';\n`;
          }
          
          // insert after first import
          const firstImportIndex = content.indexOf('import ');
          if (firstImportIndex !== -1) {
            content = content.slice(0, firstImportIndex) + importStr + content.slice(firstImportIndex);
          } else {
            content = importStr + content;
          }
        }
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Migration Complete!');
