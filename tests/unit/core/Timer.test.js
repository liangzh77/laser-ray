/**
 * Timer Unit Tests
 * 测试计时器功能（T075）
 */

import { Timer } from '../../../src/core/Timer.js';

describe('Timer - 计时器功能', () => {
  let timer;

  beforeEach(() => {
    timer = new Timer({ initialTime: 10 * 60 * 1000, increment: 10 * 1000 }); // 10分钟+10秒
  });

  describe('计时器初始化', () => {
    test('应该能创建计时器并设置初始时间', () => {
      expect(timer.timeLeft).toBe(10 * 60 * 1000);
      expect(timer.isRunning).toBe(false);
    });

    test('应该能创建无限时间的计时器', () => {
      const unlimitedTimer = new Timer({ initialTime: Infinity, increment: 0 });

      expect(unlimitedTimer.timeLeft).toBe(Infinity);
      expect(unlimitedTimer.isExpired()).toBe(false);
    });

    test('应该正确设置时间增量', () => {
      expect(timer.increment).toBe(10 * 1000);
    });
  });

  describe('计时器启动和停止', () => {
    test('应该能启动计时器', () => {
      timer.start();

      expect(timer.isRunning).toBe(true);
    });

    test('应该能停止计时器', () => {
      timer.start();
      timer.stop();

      expect(timer.isRunning).toBe(false);
    });

    test('应该能暂停和恢复计时器', () => {
      timer.start();
      const timeBeforePause = timer.timeLeft;

      timer.pause();
      expect(timer.isRunning).toBe(false);

      // 等待一段时间
      // （在实际运行中时间不应该减少）

      timer.resume();
      expect(timer.isRunning).toBe(true);
      expect(timer.timeLeft).toBe(timeBeforePause);
    });
  });

  describe('时间更新', () => {
    test('应该能减少剩余时间', () => {
      const initialTime = timer.timeLeft;

      timer.decreaseTime(1000); // 减少1秒

      expect(timer.timeLeft).toBe(initialTime - 1000);
    });

    test('应该能增加剩余时间', () => {
      const initialTime = timer.timeLeft;

      timer.addIncrement();

      expect(timer.timeLeft).toBe(initialTime + timer.increment);
    });

    test('时间不应该减少到负数', () => {
      timer.decreaseTime(timer.timeLeft + 1000);

      expect(timer.timeLeft).toBe(0);
      expect(timer.timeLeft).toBeGreaterThanOrEqual(0);
    });

    test('无限时间的计时器时间不应该改变', () => {
      const unlimitedTimer = new Timer({ initialTime: Infinity, increment: 0 });

      unlimitedTimer.decreaseTime(1000);

      expect(unlimitedTimer.timeLeft).toBe(Infinity);
      expect(unlimitedTimer.isExpired()).toBe(false);
    });
  });

  describe('时间耗尽检测', () => {
    test('应该能检测时间是否耗尽', () => {
      expect(timer.isExpired()).toBe(false);

      timer.decreaseTime(timer.timeLeft);

      expect(timer.isExpired()).toBe(true);
    });

    test('时间耗尽时应该触发回调', (done) => {
      timer.onExpired = () => {
        expect(timer.isExpired()).toBe(true);
        done();
      };

      timer.decreaseTime(timer.timeLeft);
    });

    test('无限时间的计时器永不耗尽', () => {
      const unlimitedTimer = new Timer({ initialTime: Infinity, increment: 0 });

      unlimitedTimer.decreaseTime(Number.MAX_SAFE_INTEGER);

      expect(unlimitedTimer.isExpired()).toBe(false);
    });
  });

  describe('时间格式化', () => {
    test('应该能将时间格式化为字符串', () => {
      timer.timeLeft = 10 * 60 * 1000; // 10:00

      const formatted = timer.getFormattedTime();

      expect(formatted).toBe('10:00');
    });

    test('应该正确格式化秒数', () => {
      timer.timeLeft = 1 * 60 * 1000 + 5 * 1000; // 1:05

      const formatted = timer.getFormattedTime();

      expect(formatted).toBe('01:05');
    });

    test('应该正确格式化小于1分钟的时间', () => {
      timer.timeLeft = 45 * 1000; // 0:45

      const formatted = timer.getFormattedTime();

      expect(formatted).toBe('00:45');
    });

    test('应该正确格式化小于10秒的时间', () => {
      timer.timeLeft = 5 * 1000; // 0:05

      const formatted = timer.getFormattedTime();

      expect(formatted).toBe('00:05');
    });

    test('无限时间应该显示为特殊标记', () => {
      const unlimitedTimer = new Timer({ initialTime: Infinity, increment: 0 });

      const formatted = unlimitedTimer.getFormattedTime();

      expect(formatted).toBe('∞');
    });
  });

  describe('计时器重置', () => {
    test('应该能重置计时器', () => {
      const initialTime = timer.timeLeft;

      timer.decreaseTime(5000);
      timer.reset();

      expect(timer.timeLeft).toBe(initialTime);
      expect(timer.isRunning).toBe(false);
    });

    test('重置后应该能再次启动', () => {
      timer.start();
      timer.decreaseTime(5000);
      timer.reset();

      timer.start();

      expect(timer.isRunning).toBe(true);
      expect(timer.timeLeft).toBe(10 * 60 * 1000);
    });
  });

  describe('计时器状态', () => {
    test('应该能获取计时器状态', () => {
      const state = timer.getState();

      expect(state).toHaveProperty('timeLeft');
      expect(state).toHaveProperty('isRunning');
      expect(state).toHaveProperty('isExpired');
      expect(state).toHaveProperty('formattedTime');
    });

    test('应该能从状态恢复计时器', () => {
      timer.start();
      timer.decreaseTime(5000);

      const state = timer.getState();

      const newTimer = new Timer({ initialTime: 10 * 60 * 1000, increment: 10 * 1000 });
      newTimer.setState(state);

      expect(newTimer.timeLeft).toBe(timer.timeLeft);
      expect(newTimer.isRunning).toBe(timer.isRunning);
    });
  });

  describe('自动更新功能', () => {
    test('启动后应该自动递减时间', (done) => {
      const initialTime = timer.timeLeft;

      timer.start();

      setTimeout(() => {
        timer.stop();

        // 时间应该已经减少
        expect(timer.timeLeft).toBeLessThan(initialTime);
        done();
      }, 100); // 等待100ms
    });

    test('停止后不应该继续递减时间', (done) => {
      timer.start();
      timer.stop();

      const timeAfterStop = timer.timeLeft;

      setTimeout(() => {
        expect(timer.timeLeft).toBe(timeAfterStop);
        done();
      }, 100);
    });
  });

  describe('多个计时器实例', () => {
    test('多个计时器应该独立运行', () => {
      const timer1 = new Timer({ initialTime: 10 * 60 * 1000, increment: 0 });
      const timer2 = new Timer({ initialTime: 15 * 60 * 1000, increment: 10 * 1000 });

      timer1.start();
      timer2.start();

      timer1.decreaseTime(1000);

      expect(timer1.timeLeft).toBe(10 * 60 * 1000 - 1000);
      expect(timer2.timeLeft).toBe(15 * 60 * 1000);
    });
  });
});
