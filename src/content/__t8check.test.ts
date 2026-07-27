import { describe, it, expect } from 'vitest';
import { track8 } from './t8-adversarial';
import { auditLesson } from './types';
import { isKnownFigure, isKnownLab } from './registry';
import type { Quiz } from './types';

const ROLES = new Set([
  'SOC Analyst', 'Detection Engineer', 'Threat Hunter', 'Security Data Scientist', 'ML Engineer',
  'Red Teamer', 'AI Security Engineer', 'Malware Analyst', 'Security Architect', 'GRC / Compliance',
]);

describe('t8', () => {
  it('kiểm tra toàn diện', () => {
    const problems: string[] = [];
    const quizIds = new Set<string>();
    const cardIds = new Set<string>();
    const lessonIds = new Set<string>();

    expect(track8.lessons.length).toBe(6);

    for (const l of track8.lessons) {
      if (lessonIds.has(l.id)) problems.push(`trùng lesson ${l.id}`);
      lessonIds.add(l.id);
      if (l.trackId !== track8.id) problems.push(`${l.id} trackId sai`);
      if (l.minutes < 12 || l.minutes > 22) problems.push(`${l.id} minutes ${l.minutes}`);
      for (const r of l.why.roles) if (!ROLES.has(r)) problems.push(`${l.id} role lạ: ${r}`);
      for (const i of auditLesson(l)) problems.push(`${l.id} audit: ${i.severity} ${i.message}`);
      if (l.cards.length < 3 || l.cards.length > 5) problems.push(`${l.id} cards ${l.cards.length}`);
      if (l.quiz.length < 3 || l.quiz.length > 5) problems.push(`${l.id} quiz ${l.quiz.length}`);
      if (!l.blocks.some((b) => b.t === 'predict')) problems.push(`${l.id} thiếu predict`);
      if (!l.blocks.some((b) => b.t === 'checkpoint')) problems.push(`${l.id} thiếu checkpoint`);
      if (!l.blocks.some((b) => b.t === 'callout' && (b.kind === 'pitfall' || b.kind === 'warn')))
        problems.push(`${l.id} thiếu pitfall/warn`);
      if (!l.blocks.some((b) => b.t === 'figure' || b.t === 'lab' || b.t === 'table' || b.t === 'compare'))
        problems.push(`${l.id} thiếu trực quan`);

      for (const c of l.cards) {
        if (cardIds.has(c.id)) problems.push(`trùng card ${c.id}`);
        cardIds.add(c.id);
        if (!c.id.startsWith(l.id.replace('-', ''))) problems.push(`card ${c.id} sai tiền tố`);
        if (c.back.length > 320) problems.push(`card ${c.id} back dài ${c.back.length}`);
        if (c.front.length < 11) problems.push(`card ${c.id} front ngắn`);
      }

      const inline = l.blocks.flatMap((b) => (b.t === 'checkpoint' ? b.questions : [])) as Quiz[];
      for (const q of [...l.quiz, ...inline]) {
        if (quizIds.has(q.id)) problems.push(`trùng quiz ${q.id}`);
        quizIds.add(q.id);
        if (!q.id.startsWith(l.id.replace('-', ''))) problems.push(`quiz ${q.id} sai tiền tố`);
        if ((q.why?.length ?? 0) <= 20) problems.push(`quiz ${q.id} why ngắn`);
        if (q.q.length <= 8) problems.push(`quiz ${q.id} q ngắn`);
        if (q.kind === 'mcq') {
          if (q.answer < 0 || q.answer >= q.options.length) problems.push(`quiz ${q.id} answer ngoài phạm vi`);
          if (q.distractorWhy) {
            if (q.distractorWhy.length !== q.options.length) problems.push(`quiz ${q.id} distractorWhy sai độ dài`);
            if (q.distractorWhy[q.answer] !== '') problems.push(`quiz ${q.id} distractorWhy[answer] phải rỗng`);
            q.distractorWhy.forEach((d, i) => {
              if (i !== q.answer && d === '') problems.push(`quiz ${q.id} distractorWhy[${i}] rỗng sai chỗ`);
            });
          }
        }
        if (q.kind === 'multi') {
          if (q.answers.length >= q.options.length) problems.push(`quiz ${q.id} multi đủ hết`);
          if (new Set(q.answers).size !== q.answers.length) problems.push(`quiz ${q.id} multi trùng`);
          for (const a of q.answers) if (a < 0 || a >= q.options.length) problems.push(`quiz ${q.id} multi ngoài phạm vi`);
        }
        if (q.kind === 'order') {
          if (q.items.length < 3) problems.push(`quiz ${q.id} order ít`);
          if (new Set(q.items).size !== q.items.length) problems.push(`quiz ${q.id} order trùng`);
        }
        if (q.kind === 'match') {
          if (new Set(q.pairs.map((p) => p[1])).size !== q.pairs.length) problems.push(`quiz ${q.id} match vế phải trùng`);
          if (new Set(q.pairs.map((p) => p[0])).size !== q.pairs.length) problems.push(`quiz ${q.id} match vế trái trùng`);
        }
        if (q.kind === 'input' && q.accept.length === 0) problems.push(`quiz ${q.id} input rỗng`);
      }

      for (const b of l.blocks) {
        if (b.t === 'figure' && !isKnownFigure(b.id)) problems.push(`${l.id} figure lạ ${b.id}`);
        if (b.t === 'lab' && !isKnownLab(b.id)) problems.push(`${l.id} lab lạ ${b.id}`);
      }
      for (const t of l.terms ?? []) if (!/^[a-z0-9-]+$/.test(t)) problems.push(`${l.id} term có dấu: ${t}`);
      for (const b of l.blocks) if (b.t === 'terms') for (const t of b.ids) if (!/^[a-z0-9-]+$/.test(t)) problems.push(`${l.id} terms block: ${t}`);
    }

    // figure/lab bắt buộc theo đề bài
    const fig = (id: string) => track8.lessons.flatMap((l) => l.blocks).some((b) => b.t === 'figure' && b.id === id);
    const lab = (id: string) => track8.lessons.flatMap((l) => l.blocks).some((b) => b.t === 'lab' && b.id === id);
    if (!fig('fig-atlas')) problems.push('thiếu fig-atlas');
    if (!fig('fig-adversarial')) problems.push('thiếu fig-adversarial');
    if (!lab('lab-adversarial')) problems.push('thiếu lab-adversarial');
    if (!lab('lab-poison')) problems.push('thiếu lab-poison');
    if (!track8.blurb || track8.outcomes.length < 4) problems.push('track thiếu blurb/outcomes');

    expect(problems).toEqual([]);
    console.log('tổng phút:', track8.lessons.reduce((s, l) => s + l.minutes, 0),
      '| cards:', cardIds.size, '| quiz:', quizIds.size);
  });
});
