import { test } from '@japa/runner'

import { LEVELS, calculateProgression, levelFromXp } from '#focus/services/progression'
import type { DailyActivity } from '#focus/services/focus_session_service'

function day(date: string, totalSeconds: number): DailyActivity {
  return { date, totalSeconds }
}

test.group('Focus / progression math', () => {
  test('the level table has 15 strictly harder levels', ({ assert }) => {
    assert.lengthOf(LEVELS, 15)
    for (let i = 1; i < LEVELS.length; i++) {
      const previous = LEVELS[i - 1]!.xpForLevel
      const current = LEVELS[i]!.xpForLevel
      if (current === null) continue
      assert.isAbove(current, previous!)
    }
    assert.isNull(LEVELS[14]!.xpForLevel)
  })

  test('levelFromXp maps boundaries exactly', ({ assert }) => {
    assert.deepEqual(levelFromXp(0).level, { index: 1, tier: 'bronze', division: 1 })
    assert.deepEqual(levelFromXp(99).level, { index: 1, tier: 'bronze', division: 1 })
    assert.deepEqual(levelFromXp(100).level, { index: 2, tier: 'bronze', division: 2 })
    assert.deepEqual(levelFromXp(450).level, { index: 4, tier: 'silver', division: 1 })
    assert.deepEqual(levelFromXp(1850).level, { index: 7, tier: 'gold', division: 1 })
    assert.deepEqual(levelFromXp(6200).level, { index: 10, tier: 'platinum', division: 1 })
    assert.deepEqual(levelFromXp(19300).level, { index: 13, tier: 'diamond', division: 1 })
    const apex = levelFromXp(999999)
    assert.deepEqual(apex.level, { index: 15, tier: 'diamond', division: 3 })
    assert.isNull(apex.xpForLevel)
  })

  test('empty history is Bronze I at rest', ({ assert }) => {
    assert.deepEqual(calculateProgression([], '2026-01-10'), {
      xp: 0,
      level: { index: 1, tier: 'bronze', division: 1 },
      xpIntoLevel: 0,
      xpForLevel: 100,
      streakDays: 0,
      multiplier: 1,
    })
  })

  test('a worked day earns a minute of XP per minute of focus', ({ assert }) => {
    const snapshot = calculateProgression([day('2026-01-10', 3600)], '2026-01-10')
    assert.equal(snapshot.xp, 60)
    assert.equal(snapshot.streakDays, 1)
    assert.equal(snapshot.multiplier, 1)
  })

  test('the active-day threshold is a hard gate', ({ assert }) => {
    const under = calculateProgression([day('2026-01-10', 599)], '2026-01-10')
    assert.equal(under.xp, 0)
    assert.equal(under.streakDays, 0)

    const over = calculateProgression([day('2026-01-10', 600)], '2026-01-10')
    assert.equal(over.xp, 10)
    assert.equal(over.streakDays, 1)
  })

  test('consecutive days compound the streak bonus', ({ assert }) => {
    const snapshot = calculateProgression(
      [day('2026-01-08', 3600), day('2026-01-09', 3600), day('2026-01-10', 3600)],
      '2026-01-10'
    )
    // 60 + 63 + 66
    assert.equal(snapshot.xp, 189)
    assert.equal(snapshot.streakDays, 3)
    assert.equal(snapshot.multiplier, 1.1)
  })

  test('the streak bonus caps at ×1.5', ({ assert }) => {
    const days: DailyActivity[] = []
    for (let i = 11; i >= 0; i--) {
      const date = `2026-01-${String(20 - i).padStart(2, '0')}`
      days.push(day(date, 3600))
    }
    const snapshot = calculateProgression(days, '2026-01-20')
    // 60+63+66+69+72+75+78+81+84+87 then two capped days at 90
    assert.equal(snapshot.xp, 915)
    assert.equal(snapshot.multiplier, 1.5)
  })

  test('idle days decay progressively and today never decays', ({ assert }) => {
    const snapshot = calculateProgression([day('2026-01-01', 36000)], '2026-01-05')
    // 600 earned, then -10 -20 -30 for Jan 2-4; Jan 5 (today) untouched
    assert.equal(snapshot.xp, 540)
    assert.deepEqual(snapshot.level, { index: 4, tier: 'silver', division: 1 })
    assert.equal(snapshot.xpIntoLevel, 90)
    assert.equal(snapshot.streakDays, 0)
    assert.equal(snapshot.multiplier, 1)
  })

  test('decay clamps at zero', ({ assert }) => {
    const snapshot = calculateProgression([day('2026-01-01', 36000)], '2026-02-10')
    assert.equal(snapshot.xp, 0)
    assert.deepEqual(snapshot.level, { index: 1, tier: 'bronze', division: 1 })
  })

  test('decay demotes across tier boundaries', ({ assert }) => {
    // 500 XP = Silver I; three idle days bring it under the tier floor
    const snapshot = calculateProgression([day('2026-01-01', 30000)], '2026-01-05')
    assert.equal(snapshot.xp, 440)
    assert.deepEqual(snapshot.level, { index: 3, tier: 'bronze', division: 3 })
  })

  test('an idle today leaves the streak at risk with a prospective bonus', ({ assert }) => {
    const snapshot = calculateProgression([day('2026-01-01', 6000)], '2026-01-02')
    assert.equal(snapshot.xp, 100)
    assert.equal(snapshot.streakDays, 1)
    assert.equal(snapshot.multiplier, 1.05)
  })

  test('a gap resets the streak', ({ assert }) => {
    const snapshot = calculateProgression(
      [day('2026-01-01', 3600), day('2026-01-03', 3600)],
      '2026-01-03'
    )
    // 60, -10 for the gap, then a fresh streak of 1 earning 60
    assert.equal(snapshot.xp, 110)
    assert.equal(snapshot.streakDays, 1)
    assert.equal(snapshot.multiplier, 1)
  })

  test('input order does not matter', ({ assert }) => {
    const days = [day('2026-01-09', 3600), day('2026-01-08', 3600), day('2026-01-10', 3600)]
    assert.deepEqual(
      calculateProgression(days, '2026-01-10'),
      calculateProgression([...days].reverse(), '2026-01-10')
    )
  })

  test('an elapsed sub-threshold day counts as idle', ({ assert }) => {
    const snapshot = calculateProgression(
      [day('2026-01-01', 3600), day('2026-01-02', 300)],
      '2026-01-03'
    )
    assert.equal(snapshot.xp, 50)
    assert.equal(snapshot.streakDays, 0)
  })
})
