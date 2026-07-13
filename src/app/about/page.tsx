'use client';

import React from 'react';
import BeadCard from '@/components/shared/BeadCard';
import BeadButton from '@/components/shared/BeadButton';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-[#2D3436] mb-3">🧸 关于慧星豆趣</h1>
        <p className="text-[#2D3436]/50 text-lg">让每一颗拼豆都充满乐趣</p>
      </div>

      <BeadCard>
        <h2 className="text-xl font-bold text-[#2D3436] mb-3">📖 项目介绍</h2>
        <p className="text-[#2D3436]/70 leading-relaxed">
          慧星豆趣（BeadJoy）是一个免费开源的拼豆底稿在线生成工具。
          上传任意图片，自动转换为拼豆像素画底稿，支持 MARD / COCO / 漫漫 / 盼盼 / 咪小窝 五大品牌色号体系。
          提供快速出图、AI 智能优化、手动精修三种模式，满足不同需求。
        </p>
      </BeadCard>

      <BeadCard>
        <h2 className="text-xl font-bold text-[#2D3436] mb-3">💰 支持我们</h2>
        <p className="text-[#2D3436]/70 mb-4">慧星豆趣完全免费，如果你觉得好用，欢迎打赏支持我们继续改进！</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <div className="text-center p-6 bg-gray-50 rounded-2xl flex-1">
            <div className="w-40 h-40 mx-auto mb-2 bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-[#2D3436]/20">
              <span className="text-4xl">💚</span>
            </div>
            <p className="text-sm text-[#2D3436]/50">微信赞赏码</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl flex-1">
            <div className="w-40 h-40 mx-auto mb-2 bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-[#2D3436]/20">
              <span className="text-4xl">💙</span>
            </div>
            <p className="text-sm text-[#2D3436]/50">支付宝收款码</p>
          </div>
        </div>
      </BeadCard>

      <BeadCard>
        <h2 className="text-xl font-bold text-[#2D3436] mb-3">🔗 链接</h2>
        <div className="flex gap-4 flex-wrap">
          <a href="https://github.com/huixing-user/beadjoy-web" target="_blank" rel="noopener noreferrer">
            <BeadButton variant="outline">🐙 GitHub</BeadButton>
          </a>
          <BeadButton variant="outline" onClick={() => navigator.clipboard?.writeText('beadjoy.vercel.app')}>📋 复制网址</BeadButton>
        </div>
      </BeadCard>
    </div>
  );
}
