'use client';

import React from 'react';
import BeadButton from '@/components/shared/BeadButton';

type Props = { onDownload: () => void; onDownloadList: () => void; onShareToGallery: () => void; hasData: boolean };

export default function ExportButtons({ onDownload, onDownloadList, onShareToGallery, hasData }: Props) {
  return (
    <div className="space-y-2">
      <BeadButton variant="primary" onClick={onDownload} disabled={!hasData} className="w-full">📥 下载图纸</BeadButton>
      <BeadButton variant="secondary" onClick={onDownloadList} disabled={!hasData} className="w-full">📋 采购清单</BeadButton>
      <BeadButton variant="outline" onClick={onShareToGallery} disabled={!hasData} className="w-full">🖼️ 分享到画廊</BeadButton>
    </div>
  );
}
