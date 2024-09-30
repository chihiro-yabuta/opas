import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Region() {
  const [region, setRegion] = useState(regions[0]);

  return <div
    style={{ display: 'flex', justifyContent: 'center' }}
  >
    {regions.map((r, i) => <motion.div
      key={i}
      initial={{ backgroundColor: '#ffffff' }}
      whileHover={{ backgroundColor: `${region === r ? '#84a2d4' : '#e0ffff'}` }}
      animate={{ backgroundColor: `${region === r ? '#84a2d4' : '#ffffff'}` }}
      style={{
        display: 'grid', writingMode: 'vertical-rl', placeItems: 'center',
        boxShadow: '0 0 0 2px #84a2d4', width: '5%', fontSize: '2vw', padding: '20px 0',
      }}
      onClick={() => setRegion(r)}
      children={r}
    />)}
  </div>
}

const regions = [
  '大阪府',
  '豊中市',
  '茨木市',
  '堺市',
  '高石市',
  '大阪狭山市',
  '熊取町',
  '池田市',
  '東大阪市',
  '吹田市',
  '和泉市',
  '高槻市',
  '河内長野市',
  '大阪市',
  '富田林市',
  '河南町',
  '太子町',
  '千早赤阪村',
];