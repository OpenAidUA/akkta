'use client';

import React, { useState } from 'react';
import { Download } from 'react-feather';

import { Button } from '@/components/ui/button';

export const DownloadButton = ({ actId }: { actId: string }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/acts/${actId}/pdf`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `act-${actId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Ошибка скачивания:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      disabled={isDownloading}
      size="sm"
      className="h-8 w-8 p-0 text-slate-400 hover:bg-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleDownload}
    >
      <Download size={16} />
    </Button>
  );
};
