const fs = require('fs');
const p = 'src/screens/CropIntroScreen.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/import {.*?MaterialCommunityIcons.*?} from '@expo\/vector-icons';\r?\n?/g, '');
if (!c.includes('lucide-react-native')) {
  c = `import * as LucideIcons from 'lucide-react-native';\n` + c;
}

c = c.replace(/icon: keyof typeof MaterialCommunityIcons\.glyphMap;/g, 'icon: any;');
c = c.replace(/{ icon: 'sprout',/g, `{ icon: 'Sprout',`);
c = c.replace(/{ icon: 'bug',/g, `{ icon: 'Bug',`);
c = c.replace(/{ icon: 'chart-line',/g, `{ icon: 'LineChart',`);
c = c.replace(/{ icon: 'seed',/g, `{ icon: 'Leaf',`);

c = c.replace(/<MaterialCommunityIcons name=\{card\.icon\} size=\{24\} color=\{card\.active \? theme\.colors\.textOnDark : theme\.colors\.primaryDark\} \/>/g, 
  `{(() => { const IconComp = (LucideIcons as any)[card.icon]; return IconComp ? <IconComp size={24} color={card.active ? theme.colors.textOnDark : theme.colors.primaryDark} /> : null; })()}`);

fs.writeFileSync(p, c, 'utf8');
console.log('Fixed CropIntroScreen');
