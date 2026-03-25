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
  '<Ionicons name="logo-google"': '<Chrome', 
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

const dynamicReplacements = [
  { file: 'NotificationScreen.tsx', from: `alert: 'alert-circle'`, to: `alert: 'AlertCircle'` },
  { file: 'NotificationScreen.tsx', from: `market: 'trending-up'`, to: `market: 'TrendingUp'` },
  { file: 'NotificationScreen.tsx', from: `weather: 'partly-sunny'`, to: `weather: 'CloudSun'` },
  { file: 'NotificationScreen.tsx', from: `system: 'information-circle'`, to: `system: 'Info'` },
  { file: 'NotificationScreen.tsx', from: `Record<NotificationType, keyof typeof Ionicons.glyphMap>`, to: `Record<NotificationType, keyof typeof LucideIcons>` },
  { file: 'NotificationScreen.tsx', from: `<Ionicons name={TYPE_ICONS[item.type]}`, to: `{(() => { const IconComp = (LucideIcons as any)[TYPE_ICONS[item.type]]; return IconComp ? <IconComp` },
  { file: 'NotificationScreen.tsx', from: `size={22} color={theme.colors.primary} />\n                </View>`, to: `size={22} color={theme.colors.primary} /> : null; })()}\n                </View>` }
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

      // Remove @expo/vector-icons imports ONLY if it hasn't been done
      if (content.includes(`from '@expo/vector-icons'`)) {
        content = content.replace(/import\s+{.*}\s+from\s+'@expo\/vector-icons';\n?/g, '');
        changed = true;
      }

      // Collect Lucide imports needed
      const usedIcons = new Set();
      
      for (const [key, value] of Object.entries(iconMap)) {
        if (content.includes(key)) {
          content = content.replaceAll(key, value);
          usedIcons.add(value.replace('<', ''));
          changed = true;
        }
      }

      for (const rep of dynamicReplacements) {
        if (fullPath.endsWith(rep.file) && content.includes(rep.from)) {
          content = content.replace(rep.from, rep.to);
          changed = true;
        }
      }

      if (fullPath.endsWith('CropIntroScreen.tsx') && content.includes('<MaterialCommunityIcons name={card.icon}')) {
        content = content.replace(
          `<View style={[styles.iconBox, card.active && styles.iconBoxActive]}>\n                <MaterialCommunityIcons name={card.icon} size={24} color={card.active ? theme.colors.textOnDark : theme.colors.primaryDark} />\n              </View>`,
          `<View style={[styles.iconBox, card.active && styles.iconBoxActive]}>\n                {(() => {\n                  const IconComp = (LucideIcons as any)[card.icon];\n                  return IconComp ? <IconComp size={24} color={card.active ? theme.colors.textOnDark : theme.colors.primaryDark} /> : null;\n                })()}\n              </View>`
        );
        content = content.replace(`icon: keyof typeof MaterialCommunityIcons.glyphMap`, `icon: keyof typeof LucideIcons`);
        content = content.replace(`{ icon: 'sprout',`, `{ icon: 'Sprout',`);
        content = content.replace(`{ icon: 'bug',`, `{ icon: 'Bug',`);
        content = content.replace(`{ icon: 'chart-line',`, `{ icon: 'LineChart',`);
        content = content.replace(`{ icon: 'seed',`, `{ icon: 'Leaf',`);
        changed = true;
      }

      if (fullPath.endsWith('ui.tsx')) {
        if (content.includes('<MaterialCommunityIcons name={icon}')) {
          content = content.replace(
            `<View style={styles.iconBadge}>\n        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primaryDark} />\n      </View>`,
            `<View style={styles.iconBadge}>\n        {(() => {\n          const IconComp = (LucideIcons as any)[icon];\n          return IconComp ? <IconComp size={20} color={theme.colors.primaryDark} /> : null;\n        })()}\n      </View>`
          );
          content = content.replace(`icon: keyof typeof MaterialCommunityIcons.glyphMap`, `icon: keyof typeof LucideIcons`);
          changed = true;
        }
        
        if (content.includes('tabIcons: Record<string, keyof typeof Ionicons.glyphMap>')) {
           content = content.replace(`tabIcons: Record<string, keyof typeof Ionicons.glyphMap>`, `tabIcons: Record<string, keyof typeof LucideIcons>`);
           content = content.replace(`HomeTab: 'home'`, `HomeTab: 'Home'`);
           content = content.replace(`ChatTab: 'chatbubble-ellipses'`, `ChatTab: 'MessageSquare'`);
           content = content.replace(`MarketplaceTab: 'leaf'`, `MarketplaceTab: 'ShoppingBag'`);
           content = content.replace(`HistoryTab: 'time'`, `HistoryTab: 'Clock'`);
           content = content.replace(`ProfileTab: 'person'`, `ProfileTab: 'User'`);
           content = content.replace(
             `<Ionicons\n                  name={tabIcons[route.name] ?? 'ellipse'}\n                  size={20}\n                  color={\n                    isFocused\n                      ? theme.colors.textOnDark\n                      : isDark\n                        ? 'rgba(247,250,248,0.72)'\n                        : theme.colors.textMuted\n                  }\n                />`,
             `{(() => {\n                  const IconComp = (LucideIcons as any)[tabIcons[route.name] ?? 'Circle'];\n                  return IconComp ? <IconComp size={20} color={isFocused ? theme.colors.textOnDark : isDark ? 'rgba(247,250,248,0.72)' : theme.colors.textMuted} /> : null;\n                })()}`
           );
           changed = true;
        }
      }
      
      if (fullPath.endsWith('NotificationScreen.tsx') || fullPath.endsWith('CropIntroScreen.tsx') || fullPath.endsWith('ui.tsx')) {
         usedIcons.add('* as LucideIcons');
      }

      if (changed) {
        if (usedIcons.size > 0 && !content.includes('lucide-react-native')) {
          const imports = Array.from(usedIcons);
          const hasWildcard = imports.includes('* as LucideIcons');
          let importStr = '';
          if (hasWildcard) {
             importStr = `import * as LucideIcons from 'lucide-react-native';\n`;
          } else {
             importStr = `import { ${Array.from(usedIcons).join(', ')} } from 'lucide-react-native';\n`;
          }
          
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
