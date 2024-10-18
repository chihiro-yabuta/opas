import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Status } from '../store/data';
import { mockError, mockInProgress } from '../store/mock';

export function Notice(props: { status: Status }) {
  let [color, noticeLine1, noticeLine2, msg] = ['', '', '', ''];
  switch (props.status.status) {
    case 'in-progress':
      color = '#10B98180';
      noticeLine1 = `「${props.status.genre}」の更新中です`;
      noticeLine2 = 'ページを更新せず、しばらくお待ちください';
      break;
    case 'error':
      color = '#EF444480';
      noticeLine1 = `「${props.status.genre}」の更新に失敗しました`;
      noticeLine2 = 'ページを更新してください';
      msg = props.status.msg;
      break;
    default:
      return <></>
  }

  return <motion.div
    initial={{ y: '-100%' }}
    animate={{ y: '0' }}
    style={{
      position: 'fixed', top: '0', left: '0',
      width: '100%', backgroundColor: color, padding: '20px',
    }}
  >
    <p style={{ margin: '10px', fontSize: '2vw' }}>{noticeLine1}</p>
    <p style={{ margin: '10px', fontSize: '2vw' }}>{noticeLine2}</p>
    {msg && <p style={{ margin: '10px', fontSize: '1.5vw' }}>エラーメッセージ：{msg}</p>}
  </motion.div>
}

export default function Index() {
  const router = useRouter();
  const { status } = router.query;
  return status
  ? <Notice status={mockError} />
  : <Notice status={mockInProgress} />
}