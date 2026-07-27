/**
 * Điểm tập hợp toàn bộ chương trình học + các truy vấn dùng chung.
 * Mọi phần khác của app chỉ đọc dữ liệu qua đây, không import trực tiếp file chặng.
 */

import type { Card, Lesson, Quiz, Track, TrackId, LessonId } from './types';
import { auditLesson } from './types';
import { track0 } from './t0-khoi-dong';
import { track1 } from './t1-nen-mong';
import { track2 } from './t2-du-lieu';
import { track3 } from './t3-ml-cot-loi';

export const TRACKS: Track[] = [
  track0,
  track1,
  track2,
  track3,
].sort((a, b) => a.order - b.order);

/* -------------------------------------------------------------------------- */
/*  Chỉ mục tra cứu nhanh                                                      */
/* -------------------------------------------------------------------------- */

export const ALL_LESSONS: Lesson[] = TRACKS.flatMap((t) => t.lessons);

const lessonById = new Map<LessonId, Lesson>(ALL_LESSONS.map((l) => [l.id, l]));
const trackById = new Map<TrackId, Track>(TRACKS.map((t) => [t.id, t]));

export const getLesson = (id: LessonId): Lesson | undefined => lessonById.get(id);
export const getTrack = (id: TrackId): Track | undefined => trackById.get(id);

/** Thứ tự học tuyến tính khuyến nghị — dùng cho nút "Bài tiếp theo". */
export const LESSON_ORDER: LessonId[] = ALL_LESSONS.map((l) => l.id);

export function neighbours(id: LessonId): { prev?: Lesson; next?: Lesson } {
  const i = LESSON_ORDER.indexOf(id);
  if (i < 0) return {};
  return {
    prev: i > 0 ? lessonById.get(LESSON_ORDER[i - 1]) : undefined,
    next: i < LESSON_ORDER.length - 1 ? lessonById.get(LESSON_ORDER[i + 1]) : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/*  Thẻ ghi nhớ & câu hỏi trên toàn khoá                                       */
/* -------------------------------------------------------------------------- */

export interface CardRef extends Card {
  lessonId: LessonId;
  lessonTitle: string;
  trackId: TrackId;
}

export const ALL_CARDS: CardRef[] = ALL_LESSONS.flatMap((l) =>
  l.cards.map((c) => ({ ...c, lessonId: l.id, lessonTitle: l.title, trackId: l.trackId })),
);

const cardById = new Map<string, CardRef>(ALL_CARDS.map((c) => [c.id, c]));
export const getCardRef = (id: string) => cardById.get(id);

export interface QuizRef {
  quiz: Quiz;
  lessonId: LessonId;
  lessonTitle: string;
  trackId: TrackId;
}

/** Gồm cả câu hỏi cuối bài lẫn câu hỏi điểm dừng giữa bài. */
export const ALL_QUIZ: QuizRef[] = ALL_LESSONS.flatMap((l) => {
  const inline = l.blocks.flatMap((b) => (b.t === 'checkpoint' ? b.questions : []));
  return [...l.quiz, ...inline].map((q) => ({
    quiz: q,
    lessonId: l.id,
    lessonTitle: l.title,
    trackId: l.trackId,
  }));
});

/* -------------------------------------------------------------------------- */
/*  Thống kê khoá học                                                          */
/* -------------------------------------------------------------------------- */

export const COURSE_STATS = {
  tracks: TRACKS.length,
  lessons: ALL_LESSONS.length,
  cards: ALL_CARDS.length,
  questions: ALL_QUIZ.length,
  minutes: ALL_LESSONS.reduce((s, l) => s + l.minutes, 0),
  labs: new Set(ALL_LESSONS.flatMap((l) => l.blocks.filter((b) => b.t === 'lab').map((b) => b.id))).size,
};

/** Tất cả nhãn khái niệm xuất hiện trong câu hỏi — dùng cho bản đồ thành thạo. */
export const ALL_CONCEPTS: string[] = [
  ...new Set(ALL_QUIZ.flatMap((q) => q.quiz.tags ?? []).concat(ALL_CARDS.flatMap((c) => c.tags ?? []))),
].sort();

/* -------------------------------------------------------------------------- */
/*  Kiểm tra sức khoẻ nội dung                                                 */
/* -------------------------------------------------------------------------- */

export function auditCourse() {
  const issues = ALL_LESSONS.flatMap(auditLesson);

  // Id trùng trên toàn khoá là lỗi nặng: nó khiến tiến độ của hai thẻ đè lên nhau.
  const seenLesson = new Set<string>();
  for (const l of ALL_LESSONS) {
    if (seenLesson.has(l.id)) {
      issues.push({ lessonId: l.id, severity: 'error', message: 'Id bài học bị trùng trên toàn khoá.' });
    }
    seenLesson.add(l.id);
  }
  const seenCard = new Set<string>();
  for (const c of ALL_CARDS) {
    if (seenCard.has(c.id)) {
      issues.push({ lessonId: c.lessonId, severity: 'error', message: `Id thẻ trùng toàn khoá: ${c.id}` });
    }
    seenCard.add(c.id);
  }
  const seenQuiz = new Set<string>();
  for (const q of ALL_QUIZ) {
    if (seenQuiz.has(q.quiz.id)) {
      issues.push({ lessonId: q.lessonId, severity: 'error', message: `Id câu hỏi trùng: ${q.quiz.id}` });
    }
    seenQuiz.add(q.quiz.id);
  }
  // Bài học trước không tồn tại → bộ lập kế hoạch sẽ khoá bài vĩnh viễn.
  for (const l of ALL_LESSONS) {
    for (const p of l.prereqs ?? []) {
      if (!lessonById.has(p)) {
        issues.push({ lessonId: l.id, severity: 'error', message: `Bài tiên quyết không tồn tại: ${p}` });
      }
    }
  }
  return issues;
}

export * from './types';
export { TERMS, getTerm } from './glossary';
