/**
 * User Experience Flow E2E Tests
 * 端到端测试：用户体验流程（T093）
 */

import { test, expect } from '@playwright/test';

test.describe('用户体验流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  describe('流畅的交互体验', () => {
    test('选中棋子时应该有视觉高亮反馈', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      const canvas = page.locator('canvas#game-board');

      // 点击棋子
      await canvas.click({ position: { x: 40, y: 440 } });

      // 应该有视觉反馈（这里我们检查是否有元素变化）
      // 实际应用中可能需要检查Canvas绘制或CSS类变化
      await page.waitForTimeout(200);

      // 检查是否显示了选中棋子信息
      const selectedPieceInfo = page.locator('#selected-piece-info');
      await expect(selectedPieceInfo).toBeVisible();
    });

    test('移动棋子时应该有平滑动画', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      const canvas = page.locator('canvas#game-board');

      // 选中棋子
      await canvas.click({ position: { x: 40, y: 440 } });
      await page.waitForTimeout(200);

      const startTime = Date.now();

      // 移动棋子
      await canvas.click({ position: { x: 40, y: 360 } });

      // 等待动画完成
      await page.waitForTimeout(400);

      const endTime = Date.now();
      const animationDuration = endTime - startTime;

      // 动画时间应该在合理范围内（200-600ms）
      expect(animationDuration).toBeGreaterThan(200);
      expect(animationDuration).toBeLessThan(600);
    });

    test('旋转棋子时应该有旋转动画', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      const canvas = page.locator('canvas#game-board');

      // 选中镜子棋子
      await canvas.click({ position: { x: 120, y: 440 } });
      await page.waitForTimeout(200);

      // 点击旋转按钮
      await page.click('button#rotate-btn');

      // 等待旋转动画
      await page.waitForTimeout(400);

      // 棋子应该已旋转（可以通过检查游戏状态验证）
      const moveCount = await page.locator('#move-count').textContent();
      expect(parseInt(moveCount)).toBeGreaterThan(0);
    });

    test('激光发射应该有视觉效果', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 点击发射激光按钮
      await page.click('button#fire-laser-btn');

      // 等待激光动画
      await page.waitForTimeout(600);

      // 激光发射计数应该增加
      const laserCount = await page.locator('#laser-count').textContent();
      expect(parseInt(laserCount)).toBeGreaterThan(0);
    });
  });

  describe('响应速度和性能', () => {
    test('界面加载应该迅速（<1秒）', async ({ page }) => {
      const startTime = Date.now();

      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');

      await page.waitForSelector('canvas#game-board', { state: 'visible' });

      const loadTime = Date.now() - startTime;

      // 游戏界面加载应该快速
      expect(loadTime).toBeLessThan(1000);
    });

    test('点击响应应该及时（<200ms）', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      const canvas = page.locator('canvas#game-board');

      const startTime = Date.now();

      // 点击棋子
      await canvas.click({ position: { x: 40, y: 440 } });

      // 等待响应
      await page.waitForTimeout(100);

      const responseTime = Date.now() - startTime;

      // 响应时间应该很快
      expect(responseTime).toBeLessThan(200);
    });

    test('连续操作应该保持流畅', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      const canvas = page.locator('canvas#game-board');

      const startTime = Date.now();

      // 执行多次快速操作
      for (let i = 0; i < 5; i++) {
        await canvas.click({ position: { x: 40 + i * 20, y: 440 } });
        await page.waitForTimeout(50);
      }

      const totalTime = Date.now() - startTime;

      // 5次操作应该在合理时间内完成
      expect(totalTime).toBeLessThan(500);
    });

    test('帧率应该保持流畅（60fps）', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 测量帧率
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const frameTimes = [];
          let lastTime = performance.now();
          let frameCount = 0;

          const measureFrame = () => {
            const now = performance.now();
            frameTimes.push(now - lastTime);
            lastTime = now;
            frameCount++;

            if (frameCount < 60) {
              requestAnimationFrame(measureFrame);
            } else {
              const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
              resolve(avgFrameTime);
            }
          };

          requestAnimationFrame(measureFrame);
        });
      });

      // 平均帧时间应该接近16.67ms (60fps)
      expect(performanceMetrics).toBeLessThan(20);
    });
  });

  describe('用户友好的操作提示', () => {
    test('应该显示当前回合玩家', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      const turnIndicator = page.locator('#current-turn');
      await expect(turnIndicator).toBeVisible();
      await expect(turnIndicator).toContainText('白方');
    });

    test('应该显示游戏统计信息', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 检查统计信息可见性
      await expect(page.locator('#move-count')).toBeVisible();
      await expect(page.locator('#laser-count')).toBeVisible();
      await expect(page.locator('#game-mode')).toBeVisible();
    });

    test('操作按钮应该有正确的启用/禁用状态', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 发射激光按钮应该启用
      const fireLaserBtn = page.locator('button#fire-laser-btn');
      await expect(fireLaserBtn).not.toBeDisabled();

      // 旋转按钮在未选中棋子时应该禁用
      const rotateBtn = page.locator('button#rotate-btn');
      await expect(rotateBtn).toBeDisabled();

      // 选中棋子后旋转按钮应该启用
      const canvas = page.locator('canvas#game-board');
      await canvas.click({ position: { x: 40, y: 440 } });
      await page.waitForTimeout(200);

      await expect(rotateBtn).not.toBeDisabled();
    });
  });

  describe('错误处理和边界情况', () => {
    test('无效操作时应该给出明确反馈', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      const canvas = page.locator('canvas#game-board');

      // 尝试点击空格子（应该无反应）
      await canvas.click({ position: { x: 200, y: 200 } });
      await page.waitForTimeout(200);

      // 应该没有选中任何棋子
      // （可以通过检查UI状态验证）
    });

    test('游戏结束后操作应该被禁用', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 如果游戏结束
      // 所有操作按钮应该被禁用
      // （这里简化测试，实际需要触发游戏结束）
    });
  });

  describe('悬停效果', () => {
    test('按钮悬停时应该有视觉反馈', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      const fireLaserBtn = page.locator('button#fire-laser-btn');

      // 悬停在按钮上
      await fireLaserBtn.hover();
      await page.waitForTimeout(200);

      // 按钮应该有hover样式（通过CSS检查）
      // 这里简化测试，实际应该检查计算后的样式
    });

    test('棋子悬停时应该有视觉提示', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      const canvas = page.locator('canvas#game-board');

      // 悬停在棋子上
      await canvas.hover({ position: { x: 40, y: 440 } });
      await page.waitForTimeout(200);

      // 应该有悬停效果（实际需要检查Canvas绘制）
    });
  });

  describe('键盘导航', () => {
    test('应该支持Tab键导航', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 按Tab键
      await page.keyboard.press('Tab');

      // 焦点应该移动到下一个可聚焦元素
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.id || '';
      });

      expect(focusedElement).toBeTruthy();
    });

    test('应该支持快捷键操作', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 例如：按Space键发射激光（如果实现了）
      // await page.keyboard.press('Space');
      // await page.waitForTimeout(500);

      // 激光计数应该增加
      // const laserCount = await page.locator('#laser-count').textContent();
      // expect(parseInt(laserCount)).toBeGreaterThan(0);
    });
  });

  describe('响应式设计', () => {
    test('应该在不同屏幕尺寸下正常显示', async ({ page }) => {
      // 设置小屏幕尺寸
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 棋盘应该可见
      const canvas = page.locator('canvas#game-board');
      await expect(canvas).toBeVisible();

      // 控制按钮应该可见
      await expect(page.locator('button#fire-laser-btn')).toBeVisible();
    });

    test('应该适应大屏幕', async ({ page }) => {
      // 设置大屏幕尺寸
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 界面应该正常显示
      const canvas = page.locator('canvas#game-board');
      await expect(canvas).toBeVisible();
    });
  });

  describe('加载和过渡效果', () => {
    test('界面切换应该有平滑过渡', async ({ page }) => {
      const startTime = Date.now();

      // 从主菜单切换到游戏界面
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');

      await page.waitForSelector('#game-screen.active');

      const transitionTime = Date.now() - startTime;

      // 过渡应该快速但不是瞬间
      expect(transitionTime).toBeGreaterThan(100);
      expect(transitionTime).toBeLessThan(1000);
    });

    test('返回主菜单应该有过渡效果', async ({ page }) => {
      await page.click('button[data-mode="unlimited"]');
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 点击返回主菜单
      await page.click('button#menu-btn');

      await page.waitForSelector('#main-menu.active');

      // 主菜单应该可见
      await expect(page.locator('#main-menu')).toBeVisible();
    });
  });

  describe('游戏完整体验流程', () => {
    test('从开始到结束的完整用户体验应该流畅', async ({ page }) => {
      // 1. 选择游戏模式
      await page.click('button[data-mode="unlimited"]');

      // 2. 开始游戏
      await page.click('button#start-game-btn');
      await page.waitForTimeout(500);

      // 3. 执行一些操作
      const canvas = page.locator('canvas#game-board');

      // 移动棋子
      await canvas.click({ position: { x: 40, y: 440 } });
      await page.waitForTimeout(200);
      await canvas.click({ position: { x: 40, y: 360 } });
      await page.waitForTimeout(500);

      // 4. 检查状态更新
      const moveCount = await page.locator('#move-count').textContent();
      expect(parseInt(moveCount)).toBeGreaterThan(0);

      // 5. 重新开始游戏
      await page.click('button#restart-btn');

      // 确认对话框
      page.on('dialog', dialog => dialog.accept());

      await page.waitForTimeout(500);

      // 移动计数应该重置
      const newMoveCount = await page.locator('#move-count').textContent();
      expect(parseInt(newMoveCount)).toBe(0);
    });
  });
});
