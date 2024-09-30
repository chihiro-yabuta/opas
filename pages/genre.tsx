import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Genre() {
  const ref = useRef(null);
  const [genre, setGenre] = useState(genres[0][0]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    document.addEventListener('click', e => !ref.current.contains(e.target) && setIsVisible(false));
  }, []);

  return <>
    <motion.div
      ref={ref}
      style={{
        textAlign: 'center', border: '2px solid #043ab9', borderRadius: '30px',
        fontSize: '2vw', padding: '10px 0',
      }}
      onClick={() => setIsVisible(true)}
      children={genre}
    />
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: isVisible ? 'auto' : 0, opacity: Number(isVisible) }}
      style={{ overflow: 'hidden' }}
    >
      {genres.map((gl, i) => <div
        key={i}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        {...gl.map((g, n) => <motion.div
          key={i * 3 + n}
          initial={{ backgroundColor: '#ffffff', border: '2px solid #84a2d4' }}
          whileHover={{ backgroundColor: '#e0ffff' }}
          animate={{ border: `2px solid ${genre === g ? '#043ab9' : '#84a2d4'}` }}
          style={{
            width: '25%', textAlign: 'center', borderRadius: '30px',
            fontSize: '1.5vw', margin: '10px 1%', padding: '10px 0',
          }}
          onClick={() => setGenre(g)}
          children={g}
        />)}
      </div>)}
    </motion.div>
  </>
}

const genres = [
  [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
  ],
  [
    '卓球',
    'テニス',
    '体操',
  ],
  [
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
  ],
  [
    'サッカー',
    'ニュースポーツ',
    '陸上・跳躍・投擲',
  ],
  [
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
  ],
  [
    'その他球技',
    'その他スポーツ',
    'その他',
  ],
];