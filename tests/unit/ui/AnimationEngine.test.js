/**
 * AnimationEngine Unit Tests
 * 测试动画引擎功能（T091）
 */

import { AnimationEngine } from '../../../src/ui/AnimationEngine.js';

describe('AnimationEngine - 动画功能', () => {
  let animationEngine;

  beforeEach(() => {
    animationEngine = new AnimationEngine();

    // 模拟requestAnimationFrame
    global.requestAnimationFrame = jest.fn((callback) => {
      setTimeout(callback, 16); // 模拟60fps
      return 1;
    });

    global.cancelAnimationFrame = jest.fn();
  });

  describe('动画初始化', () => {
    test('应该能创建动画引擎实例', () => {
      expect(animationEngine).toBeDefined();
      expect(animationEngine.animations).toEqual([]);
      expect(animationEngine.isRunning).toBe(false);
    });
  });

  describe('移动动画', () => {
    test('应该能创建移动动画', () => {
      const from = { x: 0, y: 0 };
      const to = { x: 100, y: 100 };
      const duration = 300;

      const animation = animationEngine.animateMove(from, to, duration);

      expect(animation).toBeDefined();
      expect(animation.type).toBe('move');
      expect(animation.from).toEqual(from);
      expect(animation.to).toEqual(to);
      expect(animation.duration).toBe(duration);
    });

    test('移动动画应该计算正确的进度', (done) => {
      const from = { x: 0, y: 0 };
      const to = { x: 100, y: 100 };
      const duration = 100;

      const onUpdate = jest.fn();
      const onComplete = jest.fn();

      animationEngine.animateMove(from, to, duration, onUpdate, onComplete);

      // 等待动画完成
      setTimeout(() => {
        expect(onUpdate).toHaveBeenCalled();
        expect(onComplete).toHaveBeenCalled();

        // 检查最终位置
        const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1];
        expect(lastCall[0].x).toBeCloseTo(to.x, 1);
        expect(lastCall[0].y).toBeCloseTo(to.y, 1);

        done();
      }, duration + 50);
    });

    test('应该支持缓动函数', (done) => {
      const from = { x: 0, y: 0 };
      const to = { x: 100, y: 100 };
      const duration = 100;

      const positions = [];
      const onUpdate = (pos) => positions.push({ ...pos });

      animationEngine.animateMove(from, to, duration, onUpdate, null, 'easeInOut');

      setTimeout(() => {
        expect(positions.length).toBeGreaterThan(0);

        // 缓动函数应该使中间位置不是线性的
        const midIndex = Math.floor(positions.length / 2);
        const midPos = positions[midIndex];

        // easeInOut在中间应该更快
        expect(midPos.x).toBeGreaterThan(30);
        expect(midPos.x).toBeLessThan(70);

        done();
      }, duration + 50);
    });
  });

  describe('旋转动画', () => {
    test('应该能创建旋转动画', () => {
      const fromAngle = 0;
      const toAngle = 90;
      const duration = 300;

      const animation = animationEngine.animateRotate(fromAngle, toAngle, duration);

      expect(animation).toBeDefined();
      expect(animation.type).toBe('rotate');
      expect(animation.fromAngle).toBe(fromAngle);
      expect(animation.toAngle).toBe(toAngle);
    });

    test('旋转动画应该正确计算角度', (done) => {
      const fromAngle = 0;
      const toAngle = 90;
      const duration = 100;

      const angles = [];
      const onUpdate = (angle) => angles.push(angle);

      animationEngine.animateRotate(fromAngle, toAngle, duration, onUpdate);

      setTimeout(() => {
        expect(angles.length).toBeGreaterThan(0);

        // 最终角度应该接近目标
        const finalAngle = angles[angles.length - 1];
        expect(finalAngle).toBeCloseTo(toAngle, 1);

        done();
      }, duration + 50);
    });

    test('应该支持顺时针和逆时针旋转', (done) => {
      const fromAngle = 0;
      const toAngle = -90; // 逆时针
      const duration = 100;

      const angles = [];
      const onUpdate = (angle) => angles.push(angle);

      animationEngine.animateRotate(fromAngle, toAngle, duration, onUpdate);

      setTimeout(() => {
        // 角度应该是负数
        const finalAngle = angles[angles.length - 1];
        expect(finalAngle).toBeLessThan(0);
        expect(finalAngle).toBeCloseTo(toAngle, 1);

        done();
      }, duration + 50);
    });
  });

  describe('激光动画', () => {
    test('应该能创建激光动画', () => {
      const path = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 }
      ];
      const duration = 500;

      const animation = animationEngine.animateLaser(path, duration);

      expect(animation).toBeDefined();
      expect(animation.type).toBe('laser');
      expect(animation.path).toEqual(path);
    });

    test('激光动画应该按路径进度显示', (done) => {
      const path = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 }
      ];
      const duration = 100;

      const progressUpdates = [];
      const onUpdate = (progress) => progressUpdates.push(progress);

      animationEngine.animateLaser(path, duration, onUpdate);

      setTimeout(() => {
        expect(progressUpdates.length).toBeGreaterThan(0);

        // 进度应该从0到1
        expect(progressUpdates[0]).toBeGreaterThanOrEqual(0);
        expect(progressUpdates[progressUpdates.length - 1]).toBeCloseTo(1, 1);

        done();
      }, duration + 50);
    });
  });

  describe('摧毁动画', () => {
    test('应该能创建摧毁动画', () => {
      const position = { x: 100, y: 100 };
      const duration = 400;

      const animation = animationEngine.animateDestroy(position, duration);

      expect(animation).toBeDefined();
      expect(animation.type).toBe('destroy');
      expect(animation.position).toEqual(position);
    });

    test('摧毁动画应该有爆炸效果参数', (done) => {
      const position = { x: 100, y: 100 };
      const duration = 100;

      const effects = [];
      const onUpdate = (effect) => effects.push({ ...effect });

      animationEngine.animateDestroy(position, duration, onUpdate);

      setTimeout(() => {
        expect(effects.length).toBeGreaterThan(0);

        // 应该包含爆炸参数（如粒子、透明度等）
        effects.forEach(effect => {
          expect(effect).toHaveProperty('progress');
          expect(effect.progress).toBeGreaterThanOrEqual(0);
          expect(effect.progress).toBeLessThanOrEqual(1);
        });

        done();
      }, duration + 50);
    });
  });

  describe('动画队列管理', () => {
    test('应该能同时运行多个动画', (done) => {
      const anim1Updates = [];
      const anim2Updates = [];

      animationEngine.animateMove(
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        100,
        (pos) => anim1Updates.push(pos)
      );

      animationEngine.animateRotate(
        0,
        90,
        100,
        (angle) => anim2Updates.push(angle)
      );

      expect(animationEngine.animations.length).toBe(2);

      setTimeout(() => {
        expect(anim1Updates.length).toBeGreaterThan(0);
        expect(anim2Updates.length).toBeGreaterThan(0);

        done();
      }, 150);
    });

    test('完成的动画应该从队列中移除', (done) => {
      animationEngine.animateMove(
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        50
      );

      expect(animationEngine.animations.length).toBe(1);

      setTimeout(() => {
        expect(animationEngine.animations.length).toBe(0);
        done();
      }, 100);
    });

    test('应该能取消所有动画', () => {
      animationEngine.animateMove({ x: 0, y: 0 }, { x: 100, y: 100 }, 1000);
      animationEngine.animateRotate(0, 90, 1000);

      expect(animationEngine.animations.length).toBe(2);

      animationEngine.cancelAll();

      expect(animationEngine.animations.length).toBe(0);
    });
  });

  describe('动画帧循环', () => {
    test('有动画时应该启动帧循环', () => {
      animationEngine.animateMove({ x: 0, y: 0 }, { x: 100, y: 100 }, 100);

      expect(animationEngine.isRunning).toBe(true);
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    test('所有动画完成后应该停止帧循环', (done) => {
      animationEngine.animateMove({ x: 0, y: 0 }, { x: 100, y: 100 }, 50);

      expect(animationEngine.isRunning).toBe(true);

      setTimeout(() => {
        expect(animationEngine.isRunning).toBe(false);
        done();
      }, 100);
    });

    test('应该能手动停止动画循环', () => {
      animationEngine.animateMove({ x: 0, y: 0 }, { x: 100, y: 100 }, 1000);

      expect(animationEngine.isRunning).toBe(true);

      animationEngine.stop();

      expect(animationEngine.isRunning).toBe(false);
    });
  });

  describe('性能优化', () => {
    test('应该维持60fps帧率', (done) => {
      const frameTimes = [];
      let lastTime = performance.now();

      const measureFrame = () => {
        const now = performance.now();
        frameTimes.push(now - lastTime);
        lastTime = now;
      };

      // 运行100ms的动画
      animationEngine.animateMove(
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        100,
        measureFrame
      );

      setTimeout(() => {
        // 平均帧时间应该接近16.67ms (60fps)
        const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        expect(avgFrameTime).toBeLessThan(20); // 允许一些误差

        done();
      }, 150);
    });

    test('大量动画应该不会降低性能', (done) => {
      const startTime = performance.now();

      // 创建10个同时进行的动画
      for (let i = 0; i < 10; i++) {
        animationEngine.animateMove(
          { x: i * 10, y: i * 10 },
          { x: i * 10 + 100, y: i * 10 + 100 },
          100
        );
      }

      setTimeout(() => {
        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // 总时间应该接近动画持续时间，不应该显著增加
        expect(totalTime).toBeLessThan(200);

        done();
      }, 150);
    });
  });

  describe('缓动函数', () => {
    test('应该支持linear缓动', () => {
      const easing = animationEngine.easings.linear;

      expect(easing(0)).toBe(0);
      expect(easing(0.5)).toBe(0.5);
      expect(easing(1)).toBe(1);
    });

    test('应该支持easeInOut缓动', () => {
      const easing = animationEngine.easings.easeInOut;

      expect(easing(0)).toBe(0);
      expect(easing(1)).toBe(1);

      // 中间应该有加速和减速
      const mid = easing(0.5);
      expect(mid).toBeGreaterThan(0.4);
      expect(mid).toBeLessThan(0.6);
    });

    test('应该支持easeOut缓动', () => {
      const easing = animationEngine.easings.easeOut;

      expect(easing(0)).toBe(0);
      expect(easing(1)).toBe(1);

      // 开始快，结束慢
      expect(easing(0.2)).toBeGreaterThan(0.2);
      expect(easing(0.8)).toBeLessThan(0.95);
    });
  });

  afterEach(() => {
    animationEngine.cancelAll();
    animationEngine.stop();
  });
});
